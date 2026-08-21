import { PrismaClient } from "@prisma/client";
import { calcStatus } from "../utils/statusHelper.js";

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Formats a Date to "YYYY-MM-DD HH:mm:ss" for frontend compatibility. */
const formatDateStr = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 19).replace("T", " ");
};

/** Standard error response shape for Flash Message compatibility. */
const errRes = (res, status, message, error = null) =>
  res.status(status).json({
    success: false,
    message,
    ...(error && { error: error instanceof Error ? error.message : String(error) })
  });

// ─── GET /issues ──────────────────────────────────────────────────────────────

export const getIssues = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const whereClause = {};

    if (department) whereClause.department = department;
    if (search) {
      whereClause.OR = [
        { item:        { contains: search, mode: "insensitive" } },
        { category:    { contains: search, mode: "insensitive" } },
        { subcategory: { contains: search, mode: "insensitive" } },
        { type:        { contains: search, mode: "insensitive" } },
        { faculty:     { contains: search, mode: "insensitive" } }
      ];
    }

    const issues = await prisma.issueLog.findMany({
      where:   whereClause,
      orderBy: { date: "desc" }
    });

    const formattedIssues = issues.map((i) => ({ ...i, date: formatDateStr(i.date) }));
    return res.json({ success: true, issues: formattedIssues });
  } catch (error) {
    return errRes(res, 500, "Failed to fetch issue logs.", error);
  }
};

// ─── POST /issues ─────────────────────────────────────────────────────────────

/**
 * Issues stock to a department/faculty.
 *
 * - unitCost is accepted from the body (optional). If omitted the item's current
 *   `price` is used as the fallback — ensures every IssueLog row has cost data.
 * - Enforces a hard stock guard: returns 400 if requested qty > available stock.
 * - Decrements InventoryItem stock and recalculates its status in a transaction.
 * - Fires a Low Stock notification if stock drops to or below the threshold.
 */
export const createIssue = async (req, res, next) => {
  try {
    const { category, subcategory, type, department, faculty, quantity, unitCost, date } = req.body;

    // 1. Locate the matching active InventoryItem
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        category:    { equals: category,    mode: "insensitive" },
        subcategory: { equals: subcategory, mode: "insensitive" },
        type:        { equals: type,        mode: "insensitive" }
      }
    });

    if (!existingItem) {
      return errRes(res, 404, `"${subcategory} (${type})" is not found in the active inventory. Please check the item details.`);
    }

    // 2. Hard stock guard — returns 400 so the frontend can show a Flash Message
    if (existingItem.stock < quantity) {
      return errRes(
        res,
        400,
        `Insufficient stock! Only ${existingItem.stock} unit(s) of "${existingItem.item}" available, but ${quantity} requested.`
      );
    }

    // 3. Resolve cost — use body value if provided, otherwise fall back to item's price
    const resolvedUnitCost = unitCost !== undefined ? unitCost : existingItem.price;

    // 4. Fetch system settings
    const settings  = await prisma.systemSettings.findUnique({ where: { id: 1 } });
    const threshold = settings ? settings.lowStockThreshold : 10;

    const updatedStock = existingItem.stock - quantity;
    const isLowStock   = updatedStock <= threshold;

    // 5. Atomic transaction: decrement stock + create IssueLog
    const result = await prisma.$transaction(async (tx) => {
      await tx.inventoryItem.update({
        where: { id: existingItem.id },
        data:  { stock: updatedStock, status: calcStatus(updatedStock, threshold) }
      });

      const issueDate = date ? new Date(date) : new Date();
      const newIssue  = await tx.issueLog.create({
        data: {
          item:       `${subcategory} - ${type}`,
          category,
          subcategory,
          type,
          department,
          faculty,
          quantity,
          unitCost:   resolvedUnitCost,   // ← always populated
          issuedById: req.user ? req.user.id : null,
          date:       issueDate
        }
      });

      return newIssue;
    });

    // 6. Notifications
    if (isLowStock) {
      await prisma.notification.create({
        data: {
          type:    "Low Stock Alert",
          message: `${existingItem.item} (${existingItem.type}) is below threshold! Remaining: ${updatedStock}`,
          iconType: "low-stock",
          color:   "bg-red-100 text-red-800"
        }
      });
    }

    await prisma.notification.create({
      data: {
        type:    "Stock Issued",
        message: `${quantity} × ${subcategory} (${type}) issued to ${department} — Unit cost: ₹${resolvedUnitCost.toLocaleString()}`,
        iconType: "issued",
        color:   "bg-blue-100 text-blue-800"
      }
    });

    return res.json({ success: true, issue: { ...result, date: formatDateStr(result.date) } });
  } catch (error) {
    return errRes(res, 500, "Failed to create issue log.", error);
  }
};
