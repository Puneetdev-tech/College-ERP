import { PrismaClient } from "@prisma/client";
import { Readable } from "stream";
import csv from "csv-parser";
import { calcStatus } from "../utils/statusHelper.js";

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Reads lowStockThreshold from SystemSettings (defaults to 10). */
const getThreshold = async () => {
  const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
  return settings ? settings.lowStockThreshold : 10;
};

/** Standard error response shape for Flash Message compatibility. */
const errRes = (res, status, message, error = null) =>
  res.status(status).json({
    success: false,
    message,
    ...(error && { error: error instanceof Error ? error.message : String(error) })
  });

// ─── Active Inventory (InventoryItem table only) ─────────────────────────────

export const getInventory = async (req, res, next) => {
  try {
    const { category, search, status } = req.query;
    const whereClause = {};

    if (category) whereClause.category = category;
    if (status)   whereClause.status   = status;

    if (search) {
      whereClause.OR = [
        { item:        { contains: search, mode: "insensitive" } },
        { category:    { contains: search, mode: "insensitive" } },
        { subcategory: { contains: search, mode: "insensitive" } },
        { type:        { contains: search, mode: "insensitive" } }
      ];
    }

    const items = await prisma.inventoryItem.findMany({
      where: whereClause,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
    });

    return res.json({ success: true, items });
  } catch (error) {
    return errRes(res, 500, "Failed to fetch inventory items.", error);
  }
};

// ─── Read-only Legacy Endpoints ──────────────────────────────────────────────

export const getLegacyInventory = async (req, res, next) => {
  try {
    const items = await prisma.inventory_items.findMany({ orderBy: { s_no: "asc" } });
    return res.json({ success: true, items });
  } catch (error) {
    return errRes(res, 500, "Failed to fetch legacy inventory items.", error);
  }
};

export const getLegacySanitary = async (req, res, next) => {
  try {
    const items = await prisma.sanitary_items.findMany({ orderBy: { s_no: "asc" } });
    return res.json({ success: true, items });
  } catch (error) {
    return errRes(res, 500, "Failed to fetch legacy sanitary items.", error);
  }
};

export const getLegacyElectrical = async (req, res, next) => {
  try {
    const orders = await prisma.electrical_orders.findMany({
      include: { subItem: { include: { item: true } } },
      orderBy: { id: "asc" }
    });

    const items = orders.map((order, idx) => ({
      id:               order.id,
      s_no:             idx + 1,
      item_name:        order.subItem.item.name,
      variant:          order.subItem.variant,
      dop:              order.dop,
      bill_number:      order.billNumber,
      quantity:         order.quantity,
      unit_rate:        order.unitRate,
      amount:           order.amount,
      received_quantity: order.receivedQty,
      opening_stock:    order.openingStock,
      issued:           order.issued,
      balance:          order.balance,
      avl_stock_total:  order.avlStockTotal,
      dealer_name:      order.dealerName,
      slp:              order.slp,
      remarks:          order.remarks
    }));

    return res.json({ success: true, items });
  } catch (error) {
    return errRes(res, 500, "Failed to fetch legacy electrical items.", error);
  }
};

// ─── Stock Adjustment (POST /inventory/adjust) ───────────────────────────────

/**
 * Performs a manual stock correction on an active InventoryItem.
 * Records the change in StockAdjustment for full audit trail.
 * Body (validated by adjustStockSchema): { itemId, newQuantity, reason, adjustedBy }
 * Returns 201 with the updated InventoryItem and the adjustment record.
 */
export const adjustStock = async (req, res, next) => {
  try {
    const { itemId, newQuantity, reason, adjustedBy } = req.body;

    // 1. Verify the target InventoryItem exists
    const existingItem = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!existingItem) {
      return errRes(res, 404, `Inventory item with ID ${itemId} not found.`);
    }

    const oldQuantity = existingItem.stock;
    const threshold   = await getThreshold();

    // 2. Run update + StockAdjustment creation in a transaction
    const [updatedItem, adjustment] = await prisma.$transaction(async (tx) => {
      const updated = await tx.inventoryItem.update({
        where: { id: itemId },
        data: {
          stock:  newQuantity,
          status: calcStatus(newQuantity, threshold)
        }
      });

      const adj = await tx.stockAdjustment.create({
        data: {
          itemId,
          itemName:   existingItem.item,
          oldQuantity,
          newQuantity,
          reason,
          adjustedBy
        }
      });

      return [updated, adj];
    });

    // 3. Emit a notification for the audit trail
    await prisma.notification.create({
      data: {
        type:     "Stock Adjusted",
        message:  `Stock for "${existingItem.item}" adjusted from ${oldQuantity} → ${newQuantity} by ${adjustedBy}. Reason: ${reason}`,
        iconType: "info",
        color:    "bg-purple-100 text-purple-800"
      }
    });

    return res.status(201).json({
      success:    true,
      message:    `Stock for "${existingItem.item}" successfully adjusted from ${oldQuantity} to ${newQuantity}.`,
      item:       updatedItem,
      adjustment
    });
  } catch (error) {
    return errRes(res, 500, "Failed to adjust stock. Please try again.", error);
  }
};

// ─── Create / Update / Delete Active Inventory ───────────────────────────────

export const createInventoryItem = async (req, res, next) => {
  try {
    const { item, category, subcategory, type, stock, price } = req.body;
    const threshold = await getThreshold();

    // Upsert: merge into existing if same category+subcategory+type already exists
    const existing = await prisma.inventoryItem.findFirst({
      where: {
        category:    { equals: category,            mode: "insensitive" },
        subcategory: { equals: subcategory,          mode: "insensitive" },
        type:        { equals: type || "Standard",   mode: "insensitive" }
      }
    });

    let resultItem;
    if (existing) {
      const newStock = existing.stock + stock;
      resultItem = await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: {
          stock:  newStock,
          price:  price !== undefined ? price : existing.price,
          status: calcStatus(newStock, threshold)
        }
      });
    } else {
      resultItem = await prisma.inventoryItem.create({
        data: {
          item,
          category,
          subcategory,
          type: type || "Standard",
          stock,
          price,
          status: calcStatus(stock, threshold)
        }
      });
    }

    return res.json({ success: true, item: resultItem });
  } catch (error) {
    return errRes(res, 500, "Failed to create inventory item.", error);
  }
};

export const updateInventoryItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { item, category, subcategory, type, stock, price } = req.body;
    const threshold = await getThreshold();

    const existing = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      return errRes(res, 404, "Inventory item not found.");
    }

    const updateData = {};
    if (item        !== undefined) updateData.item        = item;
    if (category    !== undefined) updateData.category    = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (type        !== undefined) updateData.type        = type;
    if (price       !== undefined) updateData.price       = price;

    if (stock !== undefined) {
      updateData.stock  = stock;
      updateData.status = calcStatus(stock, threshold);
    } else {
      updateData.status = calcStatus(existing.stock, threshold);
    }

    const updated = await prisma.inventoryItem.update({ where: { id }, data: updateData });
    return res.json({ success: true, item: updated });
  } catch (error) {
    return errRes(res, 500, "Failed to update inventory item.", error);
  }
};

export const deleteInventoryItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      return errRes(res, 404, "Inventory item not found.");
    }

    await prisma.inventoryItem.delete({ where: { id } });
    return res.json({ success: true, message: "Inventory item deleted successfully." });
  } catch (error) {
    return errRes(res, 500, "Failed to delete inventory item.", error);
  }
};

// ─── CSV Import ───────────────────────────────────────────────────────────────

export const importCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return errRes(res, 400, "No CSV file uploaded.");
    }

    const threshold = await getThreshold();
    const rows = [];

    await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer.toString("utf-8"));
      stream
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end",  resolve)
        .on("error", reject);
    });

    let imported = 0;
    let skipped  = 0;

    for (const row of rows) {
      const item       = row.item       || row.Item;
      const category   = row.category   || row.Category;
      const subcategory = row.subcategory || row.Subcategory;
      const type       = row.type       || row.Type || "Standard";
      const stock      = parseInt(row.stock || row.Stock, 10);
      const price      = parseFloat(row.price || row.Price);

      if (!item || !category || !subcategory || isNaN(stock) || isNaN(price)) {
        skipped++;
        continue;
      }

      const existing = await prisma.inventoryItem.findFirst({
        where: {
          category:    { equals: category,    mode: "insensitive" },
          subcategory: { equals: subcategory, mode: "insensitive" },
          type:        { equals: type,        mode: "insensitive" }
        }
      });

      if (existing) {
        const newStock = existing.stock + stock;
        await prisma.inventoryItem.update({
          where: { id: existing.id },
          data:  { stock: newStock, price, status: calcStatus(newStock, threshold) }
        });
      } else {
        await prisma.inventoryItem.create({
          data: { item, category, subcategory, type, stock, price, status: calcStatus(stock, threshold) }
        });
      }

      imported++;
    }

    return res.json({ success: true, imported, skipped });
  } catch (error) {
    return errRes(res, 500, "CSV import failed. Please check the file format.", error);
  }
};
