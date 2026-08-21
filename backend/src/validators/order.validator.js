import { z } from "zod";

// totalAmount is server-computed (quantity * pricePerUnit), never sent by client
export const createOrderSchema = z.object({
  supplier: z.string().min(1, "Supplier is required"),
  item: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  type: z.string().default("Standard"),
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),
  pricePerUnit: z
    .number({ required_error: "Price per unit is required" })
    .nonnegative("Price per unit must be 0 or more"),
  department: z.string().min(1, "Department is required"),
  faculty: z.string().min(1, "Faculty is required")
});

export const receiveOrderSchema = z.object({
  receiveDate: z
    .string({ required_error: "receiveDate is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for receiveDate (use ISO 8601)"
    })
});
