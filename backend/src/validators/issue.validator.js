import { z } from "zod";

export const createIssueSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  type: z.string().min(1, "Type is required"),
  department: z.string().min(1, "Department is required"),
  faculty: z.string().min(1, "Faculty is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  date: z.string().optional()
});
