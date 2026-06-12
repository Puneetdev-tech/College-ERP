import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMaintenanceData = async (req, res, next) => {
  try {
    const categories = await prisma.maintenanceCategory.findMany();
    const units = await prisma.maintenanceUnit.findMany({
      include: {
        history: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    res.json({
      success: true,
      categories,
      units,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }
    const id = name.toUpperCase().replace(/[^A-Z0-9]/g, "_");
    const category = await prisma.maintenanceCategory.create({
      data: {
        id,
        name,
        icon: icon || "FaTools",
      },
    });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.maintenanceCategory.delete({
      where: { id },
    });
    res.json({ success: true, message: "Maintenance category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const createUnit = async (req, res, next) => {
  try {
    const { category, name, location, initialPrice, installDate } = req.body;
    if (!category || !name) {
      return res.status(400).json({ success: false, message: "Category and name are required" });
    }
    const id = `maint-${category.toLowerCase()}-${Date.now()}`;
    const unit = await prisma.maintenanceUnit.create({
      data: {
        id,
        name,
        category,
        location: location || "Campus",
        initialPrice: parseFloat(initialPrice || 0),
        installDate: installDate || new Date().toISOString().split("T")[0],
        status: "Active",
      },
    });
    res.status(201).json({ success: true, unit });
  } catch (error) {
    next(error);
  }
};

export const deleteUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.maintenanceUnit.delete({
      where: { id },
    });
    res.json({ success: true, message: "Maintenance unit deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateUnitDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, initialPrice, installDate } = req.body;

    const unit = await prisma.maintenanceUnit.update({
      where: { id },
      data: {
        name,
        location,
        initialPrice: initialPrice ? parseFloat(initialPrice) : undefined,
        installDate,
      },
    });

    res.json({ success: true, unit });
  } catch (error) {
    next(error);
  }
};

export const updateUnitStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const unit = await prisma.maintenanceUnit.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, unit });
  } catch (error) {
    next(error);
  }
};

export const createLog = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const { partRepaired, quantity, pricePerQty, date, technician, notes } = req.body;

    if (!partRepaired) {
      return res.status(400).json({ success: false, message: "Part repaired is required" });
    }

    const qty = parseInt(quantity || 1);
    const price = parseFloat(pricePerQty || 0);
    const totalAmount = qty * price;
    const logId = `h-${unitId.replace("ro-", "")}-${Date.now()}`;

    const log = await prisma.maintenanceHistory.create({
      data: {
        id: logId,
        unitId,
        partRepaired,
        quantity: qty,
        pricePerQty: price,
        totalAmount,
        date: date || new Date().toISOString().split("T")[0],
        technician: technician || "General Technician",
        notes: notes || "",
      },
    });

    res.status(201).json({ success: true, log });
  } catch (error) {
    next(error);
  }
};

export const updateLog = async (req, res, next) => {
  try {
    const { unitId, logId } = req.params;
    const { partRepaired, quantity, pricePerQty, date, technician, notes } = req.body;

    const qty = quantity ? parseInt(quantity) : undefined;
    const price = pricePerQty ? parseFloat(pricePerQty) : undefined;

    let totalAmount = undefined;
    if (qty !== undefined || price !== undefined) {
      const currentLog = await prisma.maintenanceHistory.findUnique({
        where: { id: logId },
      });
      const finalQty = qty !== undefined ? qty : currentLog.quantity;
      const finalPrice = price !== undefined ? price : currentLog.pricePerQty;
      totalAmount = finalQty * finalPrice;
    }

    const log = await prisma.maintenanceHistory.update({
      where: { id: logId },
      data: {
        partRepaired,
        quantity: qty,
        pricePerQty: price,
        totalAmount,
        date,
        technician,
        notes,
      },
    });

    res.json({ success: true, log });
  } catch (error) {
    next(error);
  }
};

export const deleteLog = async (req, res, next) => {
  try {
    const { logId } = req.params;
    await prisma.maintenanceHistory.delete({
      where: { id: logId },
    });
    res.json({ success: true, message: "History log deleted successfully" });
  } catch (error) {
    next(error);
  }
};
