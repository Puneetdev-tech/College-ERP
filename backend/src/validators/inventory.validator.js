import { z } from "zod";

export const createInventoryItemSchema = z.object({
  item: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  type: z.string().default("Standard"),
  stock: z.number().int().nonnegative("Stock must be 0 or more").default(0),
  price: z.number().nonnegative("Price must be 0 or more").default(0)
});

export const updateInventoryItemSchema = z.object({
  item: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  type: z.string().optional(),
  stock: z.number().int().nonnegative("Stock must be 0 or more").optional(),
  price: z.number().nonnegative("Price must be 0 or more").optional()
});

// Used by POST /inventory/adjust — Stock Adjustment (Legacy import or Physical Audit)
export const adjustStockSchema = z.object({
  itemId: z.number({ required_error: "itemId is required" }).int().positive("itemId must be a positive integer"),
  newQuantity: z.number({ required_error: "newQuantity is required" }).int().nonnegative("newQuantity must be 0 or more"),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
  adjustedBy: z.string().min(1, "adjustedBy (name) is required")
});
