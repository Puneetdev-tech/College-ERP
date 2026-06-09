import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to format date string to YYYY-MM-DD HH:mm:ss
const formatDateStr = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 19).replace("T", " ");
};

export const getInventoryReport = async (req, res, next) => {
  try {
    const { category, startDate, endDate } = req.query;

    const whereClause = {};
    if (category) {
      whereClause.category = category;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Add end of day to end date
        whereClause.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const items = await prisma.inventoryItem.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    });

    const formatted = items.map((i) => ({
      ...i,
      createdAt: formatDateStr(i.createdAt),
      updatedAt: formatDateStr(i.updatedAt)
    }));

    return res.json({ success: true, items: formatted });
  } catch (error) {
    next(error);
  }
};

export const getIssuesReport = async (req, res, next) => {
  try {
    const { department, startDate, endDate } = req.query;

    const whereClause = {};
    if (department) {
      whereClause.department = department;
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const issues = await prisma.issueLog.findMany({
      where: whereClause,
      orderBy: { date: "desc" }
    });

    const formatted = issues.map((i) => ({
      ...i,
      date: formatDateStr(i.date)
    }));

    return res.json({ success: true, issues: formatted });
  } catch (error) {
    next(error);
  }
};

export const getOrdersReport = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.orderDate = {};
      if (startDate) {
        whereClause.orderDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.orderDate.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        approvalChain: {
          orderBy: { position: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formatted = orders.map((o) => ({
      ...o,
      orderDate: formatDateStr(o.orderDate),
      receiveDate: formatDateStr(o.receiveDate),
      createdAt: formatDateStr(o.createdAt),
      updatedAt: formatDateStr(o.updatedAt),
      approvalChain: o.approvalChain.map((step) => ({
        ...step,
        approvedAt: formatDateStr(step.approvedAt)
      }))
    }));

    return res.json({ success: true, orders: formatted });
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req, res, next) => {
  try {
    // 1. Get settings for threshold
    const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
    const threshold = settings ? settings.lowStockThreshold : 10;

    // 2. Aggregate statistics
    const totalItems = await prisma.inventoryItem.count();

    const lowStockCount = await prisma.inventoryItem.count({
      where: {
        stock: { lte: threshold }
      }
    });

    const totalOrders = await prisma.order.count();

    const pendingOrders = await prisma.order.count({
      where: {
        status: "Pending"
      }
    });

    const totalIssuedAgg = await prisma.issueLog.aggregate({
      _sum: {
        quantity: true
      }
    });
    const totalIssued = totalIssuedAgg._sum.quantity || 0;

    const allItems = await prisma.inventoryItem.findMany({
      select: {
        stock: true,
        price: true
      }
    });

    const totalInventoryValue = allItems.reduce(
      (sum, item) => sum + (item.stock * item.price),
      0
    );

    return res.json({
      success: true,
      totalItems,
      lowStockCount,
      totalOrders,
      pendingOrders,
      totalIssued,
      totalInventoryValue
    });
  } catch (error) {
    next(error);
  }
};
