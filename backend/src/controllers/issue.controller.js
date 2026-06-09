import { PrismaClient } from "@prisma/client";
import { calcStatus } from "../utils/statusHelper.js";

const prisma = new PrismaClient();

// Helper to format date string to match frontend expectations YYYY-MM-DD HH:mm:ss
const formatDateStr = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 19).replace("T", " ");
};

export const getIssues = async (req, res, next) => {
  try {
    const { department, search } = req.query;

    const whereClause = {};
    if (department) {
      whereClause.department = department;
    }

    if (search) {
      whereClause.OR = [
        { item: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { subcategory: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
        { faculty: { contains: search, mode: "insensitive" } }
      ];
    }

    const issues = await prisma.issueLog.findMany({
      where: whereClause,
      orderBy: { date: "desc" }
    });

    const formattedIssues = issues.map((i) => ({
      ...i,
      date: formatDateStr(i.date)
    }));

    return res.json({ success: true, issues: formattedIssues });
  } catch (error) {
    next(error);
  }
};

export const createIssue = async (req, res, next) => {
  try {
    const { category, subcategory, type, department, faculty, quantity, date } = req.body;

    // 1. Find InventoryItem by category + subcategory + type (case-insensitive)
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        category: { equals: category, mode: "insensitive" },
        subcategory: { equals: subcategory, mode: "insensitive" },
        type: { equals: type, mode: "insensitive" }
      }
    });

    if (!existingItem) {
      return res.status(404).json({ success: false, message: "Item type not found in inventory stock!" });
    }

    if (existingItem.stock < quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock! Only ${existingItem.stock} units available.` });
    }

    // 2. Fetch system settings for low stock threshold
    const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
    const threshold = settings ? settings.lowStockThreshold : 10;

    const updatedStock = existingItem.stock - quantity;
    const isLowStock = updatedStock <= threshold;

    // Transaction to update stock and log issue
    const result = await prisma.$transaction(async (tx) => {
      // Decrement stock, recalculate status
      await tx.inventoryItem.update({
        where: { id: existingItem.id },
        data: {
          stock: updatedStock,
          status: calcStatus(updatedStock, threshold)
        }
      });

      // Create IssueLog record
      const issueDate = date ? new Date(date) : new Date();
      const newIssue = await tx.issueLog.create({
        data: {
          item: `${subcategory} - ${type}`,
          category,
          subcategory,
          type,
          department,
          faculty,
          quantity,
          issuedById: req.user ? req.user.id : null,
          date: issueDate
        }
      });

      return newIssue;
    });

    // Create notifications
    if (isLowStock) {
      await prisma.notification.create({
        data: {
          type: "Low Stock Alert",
          message: `${existingItem.item} (${existingItem.type}) stock is below threshold! Remaining: ${updatedStock}`,
          iconType: "low-stock",
          color: "bg-red-100 text-red-800"
        }
      });
    }

    await prisma.notification.create({
      data: {
        type: "Stock Issued",
        message: `${quantity} ${subcategory} (${type}) issued to ${department}`,
        iconType: "issued",
        color: "bg-blue-100 text-blue-800"
      }
    });

    const formattedIssue = {
      ...result,
      date: formatDateStr(result.date)
    };

    return res.json({ success: true, issue: formattedIssue });
  } catch (error) {
    next(error);
  }
};
