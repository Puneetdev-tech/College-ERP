import { z } from "zod";

export const createIssueSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  type: z.string().min(1, "Type is required"),
  department: z.string().min(1, "Department is required"),
  faculty: z.string().min(1, "Faculty is required"),
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),
  // unitCost is optional — server falls back to the item's current price if omitted
  unitCost: z.number().nonnegative("Unit cost must be 0 or more").optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format (use ISO 8601)"
    })
    .optional()
});
