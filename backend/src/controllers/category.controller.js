import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.inventoryCategory.findMany({
      include: {
        subcategories: true,
      },
    });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, icon, desc, color } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const category = await prisma.inventoryCategory.create({
      data: {
        id,
        name,
        icon: icon || "FaBoxes",
        desc: desc || "Dynamic category",
        color: color || "from-blue-500 to-indigo-600",
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
    await prisma.inventoryCategory.delete({
      where: { id },
    });
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const createSubcategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Subcategory name is required" });
    }
    const subcategory = await prisma.inventorySubcategory.create({
      data: {
        categoryId,
        name,
      },
    });
    res.status(201).json({ success: true, subcategory });
  } catch (error) {
    next(error);
  }
};

export const deleteSubcategory = async (req, res, next) => {
  try {
    const { categoryId, name } = req.params;
    await prisma.inventorySubcategory.delete({
      where: {
        categoryId_name: {
          categoryId,
          name,
        },
      },
    });
    res.json({ success: true, message: "Subcategory deleted successfully" });
  } catch (error) {
    next(error);
  }
};
