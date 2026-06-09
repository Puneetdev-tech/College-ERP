import { z } from "zod";

export const createOrderSchema = z.object({
  supplier: z.string().min(1, "Supplier is required"),
  item: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  type: z.string().default("Standard"),
  quantity: z.number().int().positive("Quantity must be positive"),
  pricePerUnit: z.number().nonnegative("Price per unit must be non-negative"),
  department: z.string().min(1, "Department is required"),
  faculty: z.string().min(1, "Faculty is required")
});

export const receiveOrderSchema = z.object({
  receiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format for receiveDate"
  })
});
