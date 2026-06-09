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

export const getOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { supplier: { contains: search, mode: "insensitive" } },
        { item: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { faculty: { contains: search, mode: "insensitive" } }
      ];
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

    // Format dates to match frontend
    const formattedOrders = orders.map((o) => ({
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

    return res.json({ success: true, orders: formattedOrders });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { supplier, item, category, subcategory, type, quantity, pricePerUnit, department, faculty } = req.body;

    const count = await prisma.order.count();
    const orderId = `PO${String(count + 1).padStart(3, "0")}`;

    // Get active approval sequence
    let sequence = await prisma.approvalSequence.findMany({
      orderBy: { position: "asc" }
    });

    // Fallback default sequence if empty: Sanjay Mehta (role Accounts Office, ID 5) -> Dr. Roy (role Principal, ID 4)
    if (sequence.length === 0) {
      // Find the seeded Accounts Office and Principal users
      const accounts = await prisma.user.findFirst({ where: { email: "accounts@rjit.edu.in" } });
      const principal = await prisma.user.findFirst({ where: { email: "principal@rjit.edu.in" } });

      const seqData = [];
      if (accounts) seqData.push({ userId: accounts.id, position: 1 });
      if (principal) seqData.push({ userId: principal.id, position: 2 });

      if (seqData.length > 0) {
        await prisma.approvalSequence.createMany({ data: seqData });
        sequence = await prisma.approvalSequence.findMany({ orderBy: { position: "asc" } });
      }
    }

    // Prepare approval steps
    const approvalSteps = [];
    for (const seq of sequence) {
      const user = await prisma.user.findUnique({ where: { id: seq.userId } });
      approvalSteps.push({
        userId: seq.userId,
        name: user ? user.name : "System Approver",
        role: user ? user.role : "Approver",
        status: "Pending",
        position: seq.position
      });
    }

    const placedByName = req.user ? req.user.name : faculty;
    const placedById = req.user ? req.user.id : null;

    // Create Order and steps in Transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          id: orderId,
          supplier,
          item,
          category,
          subcategory,
          type: type || "Standard",
          quantity,
          pricePerUnit,
          status: "Pending",
          department,
          faculty,
          placedById,
          placedByName
        }
      });

      for (const step of approvalSteps) {
        await tx.approvalStep.create({
          data: {
            orderId: orderId,
            userId: step.userId,
            name: step.name,
            role: step.role,
            status: "Pending",
            position: step.position
          }
        });
      }

      return newOrder;
    });

    // Fetch order with steps
    const completeOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { approvalChain: { orderBy: { position: "asc" } } }
    });

    const totalCost = quantity * pricePerUnit;
    const notifMessage = `New Purchase Order ${orderId} created by ${placedByName} for ${quantity} ${item} - Total: ₹${totalCost.toLocaleString()} (₹${pricePerUnit.toLocaleString()}/unit)`;

    await prisma.notification.create({
      data: {
        type: "Purchase Order",
        message: notifMessage,
        iconType: "order",
        color: "bg-yellow-100 text-yellow-800"
      }
    });

    const formattedOrder = {
      ...completeOrder,
      orderDate: formatDateStr(completeOrder.orderDate),
      receiveDate: formatDateStr(completeOrder.receiveDate),
      createdAt: formatDateStr(completeOrder.createdAt),
      updatedAt: formatDateStr(completeOrder.updatedAt),
      approvalChain: completeOrder.approvalChain.map((step) => ({
        ...step,
        approvedAt: formatDateStr(step.approvedAt)
      }))
    };

    return res.json({ success: true, order: formattedOrder });
  } catch (error) {
    next(error);
  }
};

export const approveOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { approvalChain: { orderBy: { position: "asc" } } }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    const pendingStep = order.approvalChain.find((step) => step.status === "Pending");
    if (!pendingStep) {
      return res.status(400).json({ success: false, message: "No pending approval steps for this order!" });
    }

    // Verify current user can approve (must be the assigned user OR Admin)
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === "Admin";

    if (pendingStep.userId !== currentUserId && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access Denied: You are not authorized to approve this step!" });
    }

    const approverName = req.user.name;
    const approverRole = req.user.role;

    // Update approval step
    await prisma.approvalStep.update({
      where: { id: pendingStep.id },
      data: {
        status: "Approved",
        approvedAt: new Date(),
        name: approverName,
        role: approverRole
      }
    });

    // Check if there are any remaining pending steps
    const remainingPending = order.approvalChain.filter(
      (step) => step.id !== pendingStep.id && step.status === "Pending"
    );

    const isCompleted = remainingPending.length === 0;

    if (isCompleted) {
      await prisma.order.update({
        where: { id },
        data: { status: "Approved" }
      });
    }

    // Notifications
    const totalCost = order.quantity * order.pricePerUnit;
    await prisma.notification.create({
      data: {
        type: "Order Approved",
        message: `Order ${id} (${order.quantity} ${order.item}, Total: ₹${totalCost.toLocaleString()}) approved by ${approverName} (${approverRole})`,
        iconType: "order",
        color: "bg-green-100 text-green-800"
      }
    });

    if (isCompleted) {
      await prisma.notification.create({
        data: {
          type: "Order Approved", // Matches "received" icon logic in frontend
          message: `Order ${id} (${order.quantity} ${order.item}, Total: ₹${totalCost.toLocaleString()}) is fully approved and ready for stock receipt!`,
          iconType: "received",
          color: "bg-emerald-100 text-emerald-800"
        }
      });
    }

    // Return updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: { approvalChain: { orderBy: { position: "asc" } } }
    });

    const formattedOrder = {
      ...updatedOrder,
      orderDate: formatDateStr(updatedOrder.orderDate),
      receiveDate: formatDateStr(updatedOrder.receiveDate),
      createdAt: formatDateStr(updatedOrder.createdAt),
      updatedAt: formatDateStr(updatedOrder.updatedAt),
      approvalChain: updatedOrder.approvalChain.map((step) => ({
        ...step,
        approvedAt: formatDateStr(step.approvedAt)
      }))
    };

    return res.json({ success: true, order: formattedOrder });
  } catch (error) {
    next(error);
  }
};

export const rejectOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { approvalChain: { orderBy: { position: "asc" } } }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    const pendingStep = order.approvalChain.find((step) => step.status === "Pending");
    if (!pendingStep) {
      return res.status(400).json({ success: false, message: "No pending approval steps for this order!" });
    }

    // Verify user identity (must be the assigned user OR Admin)
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === "Admin";

    if (pendingStep.userId !== currentUserId && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access Denied: You are not authorized to reject this step!" });
    }

    const approverName = req.user.name;
    const approverRole = req.user.role;

    // Transaction to reject the step and order
    await prisma.$transaction(async (tx) => {
      await tx.approvalStep.update({
        where: { id: pendingStep.id },
        data: {
          status: "Rejected",
          approvedAt: new Date(),
          name: approverName,
          role: approverRole
        }
      });

      await tx.order.update({
        where: { id },
        data: { status: "Rejected" }
      });
    });

    // Rejection notification
    const totalCost = order.quantity * order.pricePerUnit;
    await prisma.notification.create({
      data: {
        type: "Order Rejected",
        message: `Order ${id} (${order.quantity} ${order.item}, Total: ₹${totalCost.toLocaleString()}) was rejected by ${approverName} (${approverRole})`,
        iconType: "low-stock",
        color: "bg-red-100 text-red-800"
      }
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: { approvalChain: { orderBy: { position: "asc" } } }
    });

    const formattedOrder = {
      ...updatedOrder,
      orderDate: formatDateStr(updatedOrder.orderDate),
      receiveDate: formatDateStr(updatedOrder.receiveDate),
      createdAt: formatDateStr(updatedOrder.createdAt),
      updatedAt: formatDateStr(updatedOrder.updatedAt),
      approvalChain: updatedOrder.approvalChain.map((step) => ({
        ...step,
        approvedAt: formatDateStr(step.approvedAt)
      }))
    };

    return res.json({ success: true, order: formattedOrder });
  } catch (error) {
    next(error);
  }
};

export const receiveOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { receiveDate } = req.body;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    if (order.status !== "Approved" && order.status !== "Pending" && order.status !== "Received") {
      return res.status(400).json({ success: false, message: "Order cannot be received!" });
    }

    // 1. Update Order status
    await prisma.order.update({
      where: { id },
      data: {
        status: "Received",
        receiveDate: new Date(receiveDate)
      }
    });

    // 2. Fetch system settings for low stock threshold
    const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
    const threshold = settings ? settings.lowStockThreshold : 10;

    // 3. Upsert inventory item by case-insensitive check for category + subcategory + type
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        category: { equals: order.category, mode: "insensitive" },
        subcategory: { equals: order.subcategory, mode: "insensitive" },
        type: { equals: order.type, mode: "insensitive" }
      }
    });

    if (existingItem) {
      const newStock = existingItem.stock + order.quantity;
      await prisma.inventoryItem.update({
        where: { id: existingItem.id },
        data: {
          stock: newStock,
          price: order.pricePerUnit || existingItem.price,
          status: calcStatus(newStock, threshold)
        }
      });
    } else {
      await prisma.inventoryItem.create({
        data: {
          item: order.item,
          category: order.category,
          subcategory: order.subcategory,
          type: order.type,
          stock: order.quantity,
          price: order.pricePerUnit || 1000,
          status: calcStatus(order.quantity, threshold)
        }
      });
    }

    // 4. Create Notification
    const totalValue = order.quantity * (order.pricePerUnit || 1000);
    await prisma.notification.create({
      data: {
        type: "Stock Received",
        message: `${order.quantity} units of ${order.item} (${order.type}) received for ${order.department} - Total Value: ₹${totalValue.toLocaleString()}`,
        iconType: "received",
        color: "bg-green-100 text-green-800"
      }
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: { approvalChain: { orderBy: { position: "asc" } } }
    });

    const formattedOrder = {
      ...updatedOrder,
      orderDate: formatDateStr(updatedOrder.orderDate),
      receiveDate: formatDateStr(updatedOrder.receiveDate),
      createdAt: formatDateStr(updatedOrder.createdAt),
      updatedAt: formatDateStr(updatedOrder.updatedAt),
      approvalChain: updatedOrder.approvalChain.map((step) => ({
        ...step,
        approvedAt: formatDateStr(step.approvedAt)
      }))
    };

    return res.json({ success: true, order: formattedOrder });
  } catch (error) {
    next(error);
  }
};
