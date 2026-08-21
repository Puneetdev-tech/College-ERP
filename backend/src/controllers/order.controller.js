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

/** Formats all date fields on an Order (including nested approvalChain). */
const formatOrder = (o) => ({
  ...o,
  orderDate:   formatDateStr(o.orderDate),
  receiveDate: formatDateStr(o.receiveDate),
  createdAt:   formatDateStr(o.createdAt),
  updatedAt:   formatDateStr(o.updatedAt),
  approvalChain: (o.approvalChain || []).map((step) => ({
    ...step,
    approvedAt: formatDateStr(step.approvedAt)
  }))
});

// ─── GET /orders ─────────────────────────────────────────────────────────────

export const getOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (search) {
      whereClause.OR = [
        { id:         { contains: search, mode: "insensitive" } },
        { supplier:   { contains: search, mode: "insensitive" } },
        { item:       { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { faculty:    { contains: search, mode: "insensitive" } }
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: { approvalChain: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ success: true, orders: orders.map(formatOrder) });
  } catch (error) {
    return errRes(res, 500, "Failed to fetch orders.", error);
  }
};

// ─── POST /orders ─────────────────────────────────────────────────────────────

/**
 * Creates a new Purchase Order.
 * totalAmount is computed server-side: quantity * pricePerUnit.
 * Builds an approval chain from ApprovalSequence and creates all steps in one transaction.
 */
export const createOrder = async (req, res, next) => {
  try {
    const { supplier, item, category, subcategory, type, quantity, pricePerUnit, department, faculty } = req.body;

    // Server-side financial computation — never trust the client for this
    const totalAmount = quantity * pricePerUnit;

    const count   = await prisma.order.count();
    const orderId = `PO${String(count + 1).padStart(3, "0")}`;

    // Resolve approval sequence
    let sequence = await prisma.approvalSequence.findMany({ orderBy: { position: "asc" } });

    if (sequence.length === 0) {
      const accounts  = await prisma.user.findFirst({ where: { email: "accounts@rjit.edu.in" } });
      const principal = await prisma.user.findFirst({ where: { email: "principal@rjit.edu.in" } });
      const seqData   = [];
      if (accounts)  seqData.push({ userId: accounts.id,  position: 1 });
      if (principal) seqData.push({ userId: principal.id, position: 2 });
      if (seqData.length > 0) {
        await prisma.approvalSequence.createMany({ data: seqData });
        sequence = await prisma.approvalSequence.findMany({ orderBy: { position: "asc" } });
      }
    }

    // Prepare approval steps with user details
    const approvalSteps = [];
    for (const seq of sequence) {
      const user = await prisma.user.findUnique({ where: { id: seq.userId } });
      approvalSteps.push({
        userId:   seq.userId,
        name:     user ? user.name : "System Approver",
        role:     user ? user.role : "Approver",
        status:   "Pending",
        position: seq.position
      });
    }

    const placedByName = req.user ? req.user.name : faculty;
    const placedById   = req.user ? req.user.id   : null;

    // Atomic create — Order + all ApprovalSteps
    await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          id:           orderId,
          supplier,
          item,
          category,
          subcategory,
          type:         type || "Standard",
          quantity,
          pricePerUnit,
          totalAmount,          // ← persisted server-computed value
          status:       "Pending",
          department,
          faculty,
          placedById,
          placedByName
        }
      });

      for (const step of approvalSteps) {
        await tx.approvalStep.create({
          data: {
            orderId,
            userId:   step.userId,
            name:     step.name,
            role:     step.role,
            status:   "Pending",
            position: step.position
          }
        });
      }
    });

    // Fetch fresh order with chain for response
    const completeOrder = await prisma.order.findUnique({
      where:   { id: orderId },
      include: { approvalChain: { orderBy: { position: "asc" } } }
    });

    await prisma.notification.create({
      data: {
        type:    "Purchase Order",
        message: `New Purchase Order ${orderId} by ${placedByName} for ${quantity} × ${item} — Total: ₹${totalAmount.toLocaleString()} (₹${pricePerUnit.toLocaleString()}/unit)`,
        iconType: "order",
        color:   "bg-yellow-100 text-yellow-800"
      }
    });

    return res.json({ success: true, order: formatOrder(completeOrder) });
  } catch (error) {
    return errRes(res, 500, "Failed to create order.", error);
  }
};

// ─── POST /orders/:id/approve ─────────────────────────────────────────────────

export const approveOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where:   { id },
      include: { approvalChain: { orderBy: { position: "asc" } } }
    });

    if (!order) return errRes(res, 404, `Order ${id} not found.`);

    const pendingStep = order.approvalChain.find((s) => s.status === "Pending");
    if (!pendingStep) {
      return errRes(res, 400, "No pending approval steps for this order.");
    }

    const currentUserId = req.user.id;
    const isAdmin       = req.user.role === "Admin";

    if (pendingStep.userId !== currentUserId && !isAdmin) {
      return errRes(res, 403, "Access Denied: You are not the designated approver for this step.");
    }

    await prisma.approvalStep.update({
      where: { id: pendingStep.id },
      data:  { status: "Approved", approvedAt: new Date(), name: req.user.name, role: req.user.role }
    });

    const remainingPending = order.approvalChain.filter(
      (s) => s.id !== pendingStep.id && s.status === "Pending"
    );
    const isFullyApproved = remainingPending.length === 0;

    if (isFullyApproved) {
      await prisma.order.update({ where: { id }, data: { status: "Approved" } });
    }

    const totalCost = order.totalAmount ?? order.quantity * order.pricePerUnit;
    await prisma.notification.create({
      data: {
        type:    "Order Approved",
        message: `Order ${id} (${order.quantity} × ${order.item}, ₹${totalCost.toLocaleString()}) approved by ${req.user.name} (${req.user.role})`,
        iconType: "order",
        color:   "bg-green-100 text-green-800"
      }
    });

    if (isFullyApproved) {
      await prisma.notification.create({
        data: {
          type:    "Order Approved",
          message: `Order ${id} is fully approved and ready for stock receipt!`,
          iconType: "received",
          color:   "bg-emerald-100 text-emerald-800"
        }
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where:   { id },
      include: { approvalChain: { orderBy: { position: "asc" } } }
    });

    return res.json({ success: true, order: formatOrder(updatedOrder) });
  } catch (error) {
    return errRes(res, 500, "Failed to approve order.", error);
  }
};

// ─── POST /orders/:id/reject ──────────────────────────────────────────────────

export const rejectOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where:   { id },
      include: { approvalChain: { orderBy: { position: "asc" } } }
    });

    if (!order) return errRes(res, 404, `Order ${id} not found.`);

    const pendingStep = order.approvalChain.find((s) => s.status === "Pending");
    if (!pendingStep) {
      return errRes(res, 400, "No pending approval steps for this order.");
    }

    const currentUserId = req.user.id;
    const isAdmin       = req.user.role === "Admin";

    if (pendingStep.userId !== currentUserId && !isAdmin) {
      return errRes(res, 403, "Access Denied: You are not the designated approver for this step.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.approvalStep.update({
        where: { id: pendingStep.id },
        data:  { status: "Rejected", approvedAt: new Date(), name: req.user.name, role: req.user.role }
      });
      await tx.order.update({ where: { id }, data: { status: "Rejected" } });
    });

    const totalCost = order.totalAmount ?? order.quantity * order.pricePerUnit;
    await prisma.notification.create({
      data: {
        type:    "Order Rejected",
        message: `Order ${id} (${order.quantity} × ${order.item}, ₹${totalCost.toLocaleString()}) rejected by ${req.user.name} (${req.user.role})`,
        iconType: "low-stock",
        color:   "bg-red-100 text-red-800"
      }
    });

    const updatedOrder = await prisma.order.findUnique({
      where:   { id },
      include: { approvalChain: { orderBy: { position: "asc" } } }
    });

    return res.json({ success: true, order: formatOrder(updatedOrder) });
  } catch (error) {
    return errRes(res, 500, "Failed to reject order.", error);
  }
};

// ─── POST /orders/:id/receive ─────────────────────────────────────────────────

/**
 * Marks an Order as Received and automatically increments the matching InventoryItem stock.
 * Upserts the InventoryItem — creates it if it doesn't exist yet.
 */
export const receiveOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { receiveDate, deliverySlip } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return errRes(res, 404, `Order ${id} not found.`);

    if (order.status === "Received") {
      return errRes(res, 400, `Order ${id} has already been received.`);
    }
    if (order.status === "Rejected") {
      return errRes(res, 400, `Order ${id} was rejected and cannot be received.`);
    }

    const settings  = await prisma.systemSettings.findUnique({ where: { id: 1 } });
    const threshold = settings ? settings.lowStockThreshold : 10;

    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        category:    { equals: order.category,    mode: "insensitive" },
        subcategory: { equals: order.subcategory, mode: "insensitive" },
        type:        { equals: order.type,        mode: "insensitive" }
      }
    });

    // Compute totalAmount in case it was null on old orders
    const totalAmount = order.totalAmount ?? order.quantity * order.pricePerUnit;

    await prisma.$transaction(async (tx) => {
      // Update order status + persist totalAmount & deliverySlip for audit
      await tx.order.update({
        where: { id },
        data: {
          status:      "Received",
          receiveDate: new Date(receiveDate),
          deliverySlip: deliverySlip || undefined,
          totalAmount               // ensure field is always populated after receive
        }
      });

      // Auto-increment stock
      if (existingItem) {
        const newStock = existingItem.stock + order.quantity;
        await tx.inventoryItem.update({
          where: { id: existingItem.id },
          data: {
            stock:  newStock,
            price:  order.pricePerUnit || existingItem.price,
            status: calcStatus(newStock, threshold)
          }
        });
      } else {
        await tx.inventoryItem.create({
          data: {
            item:       order.item,
            category:   order.category,
            subcategory: order.subcategory,
            type:       order.type,
            stock:      order.quantity,
            price:      order.pricePerUnit || 0,
            status:     calcStatus(order.quantity, threshold)
          }
        });
      }
    });

    await prisma.notification.create({
      data: {
        type:    "Stock Received",
        message: `${order.quantity} × ${order.item} (${order.type}) received for ${order.department} — Total Value: ₹${totalAmount.toLocaleString()}`,
        iconType: "received",
        color:   "bg-green-100 text-green-800"
      }
    });

    const updatedOrder = await prisma.order.findUnique({
      where:   { id },
      include: { approvalChain: { orderBy: { position: "asc" } } }
    });

    return res.json({ success: true, order: formatOrder(updatedOrder) });
  } catch (error) {
    return errRes(res, 500, "Failed to receive order.", error);
  }
};
