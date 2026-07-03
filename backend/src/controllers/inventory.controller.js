import { PrismaClient } from "@prisma/client";
import { Readable } from "stream";
import csv from "csv-parser";
import { calcStatus } from "../utils/statusHelper.js";

const prisma = new PrismaClient();

// Helper to get low stock threshold
const getThreshold = async () => {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 1 }
  });
  return settings ? settings.lowStockThreshold : 10;
};

export const getInventory = async (req, res, next) => {
  try {
    const { category, search, status } = req.query;

    const whereClause = {};

    if (category) {
      whereClause.category = category;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { item: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { subcategory: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } }
      ];
    }

    const items = await prisma.inventoryItem.findMany({
      where: whereClause,
      // Sort newest first: check if updatedAt exists, fallback to createdAt or id desc
      orderBy: [
        { updatedAt: "desc" },
        { createdAt: "desc" }
      ]
    });

    return res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

export const getLegacyInventory = async (req, res, next) => {
  try {
    const items = await prisma.inventory_items.findMany({
      orderBy: {
        s_no: "asc"
      }
    });
    return res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

export const getLegacySanitary = async (req, res, next) => {
  try {
    const items = await prisma.sanitary_items.findMany({
      orderBy: {
        s_no: "asc"
      }
    });
    return res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

export const getLegacyElectrical = async (req, res, next) => {
  try {
    const orders = await prisma.electrical_orders.findMany({
      include: {
        subItem: {
          include: {
            item: true
          }
        }
      },
      orderBy: {
        id: "asc"
      }
    });

    const items = orders.map((order, idx) => ({
      id: order.id,
      s_no: idx + 1,
      item_name: order.subItem.item.name,
      variant: order.subItem.variant,
      dop: order.dop,
      bill_number: order.billNumber,
      quantity: order.quantity,
      unit_rate: order.unitRate,
      amount: order.amount,
      received_quantity: order.receivedQty,
      opening_stock: order.openingStock,
      issued: order.issued,
      balance: order.balance,
      avl_stock_total: order.avlStockTotal,
      dealer_name: order.dealerName,
      slp: order.slp,
      remarks: order.remarks
    }));

    return res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};



export const createInventoryItem = async (req, res, next) => {
  try {
    const { item, category, subcategory, type, stock, price } = req.body;
    const threshold = await getThreshold();

    // Check case-insensitive combination of category + subcategory + type
    const existing = await prisma.inventoryItem.findFirst({
      where: {
        category: { equals: category, mode: "insensitive" },
        subcategory: { equals: subcategory, mode: "insensitive" },
        type: { equals: type || "Standard", mode: "insensitive" }
      }
    });

    let resultItem;
    if (existing) {
      const newStock = existing.stock + stock;
      resultItem = await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: {
          stock: newStock,
          price: price !== undefined ? price : existing.price,
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
    next(error);
  }
};

export const updateInventoryItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { item, category, subcategory, type, stock, price } = req.body;
    const threshold = await getThreshold();

    const existing = await prisma.inventoryItem.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Inventory item not found!" });
    }

    const updateData = {};
    if (item !== undefined) updateData.item = item;
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (type !== undefined) updateData.type = type;
    if (price !== undefined) updateData.price = price;

    if (stock !== undefined) {
      updateData.stock = stock;
      updateData.status = calcStatus(stock, threshold);
    } else if (existing.stock !== undefined) {
      // If stock isn't updated but threshold might have changed, recalculate
      updateData.status = calcStatus(existing.stock, threshold);
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: updateData
    });

    return res.json({ success: true, item: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteInventoryItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.inventoryItem.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Inventory item not found!" });
    }

    await prisma.inventoryItem.delete({
      where: { id }
    });

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const importCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No CSV file uploaded!" });
    }

    const threshold = await getThreshold();
    const rows = [];

    // Parse CSV from buffer
    const parsePromise = new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer.toString("utf-8"));
      stream
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });

    await parsePromise;

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const item = row.item || row.Item;
      const category = row.category || row.Category;
      const subcategory = row.subcategory || row.Subcategory;
      const type = row.type || row.Type || "Standard";
      const stock = parseInt(row.stock || row.Stock, 10);
      const price = parseFloat(row.price || row.Price);

      if (!item || !category || !subcategory || isNaN(stock) || isNaN(price)) {
        skipped++;
        continue;
      }

      // Check case-insensitive combination of category + subcategory + type
      const existing = await prisma.inventoryItem.findFirst({
        where: {
          category: { equals: category, mode: "insensitive" },
          subcategory: { equals: subcategory, mode: "insensitive" },
          type: { equals: type, mode: "insensitive" }
        }
      });

      if (existing) {
        const newStock = existing.stock + stock;
        await prisma.inventoryItem.update({
          where: { id: existing.id },
          data: {
            stock: newStock,
            price: price,
            status: calcStatus(newStock, threshold)
          }
        });
      } else {
        await prisma.inventoryItem.create({
          data: {
            item,
            category,
            subcategory,
            type,
            stock,
            price,
            status: calcStatus(stock, threshold)
          }
        });
      }
      imported++;
    }

    return res.json({ success: true, imported, skipped });
  } catch (error) {
    next(error);
  }
};
