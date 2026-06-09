import { z } from "zod";

export const createInventoryItemSchema = z.object({
  item: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  type: z.string().default("Standard"),
  stock: z.number().int().nonnegative().default(0),
  price: z.number().nonnegative().default(0)
});

export const updateInventoryItemSchema = z.object({
  item: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  type: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
  price: z.number().nonnegative().optional()
});
