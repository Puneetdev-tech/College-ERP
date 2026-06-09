import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(4, "Password must be at least 4 characters long"),
  role: z.string().min(1, "Role is required"),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  permissions: z.array(z.string()).default([]),
  phone: z.string().optional().nullable(),
  photo: z.string().optional().nullable()
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(4).optional().or(z.literal("")),
  role: z.string().optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  permissions: z.array(z.string()).optional(),
  phone: z.string().optional().nullable(),
  photo: z.string().optional().nullable()
});

export const approvalSequenceSchema = z.object({
  userIds: z.array(z.number({ invalid_type_error: "User IDs must be numbers" }))
});
