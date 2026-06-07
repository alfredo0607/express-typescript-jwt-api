import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(100).trim().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const adminUpdateUserSchema = z
  .object({
    name: z.string().min(2).max(100).trim().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
    role: z.enum(["admin", "user", "viewer"]).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const createUserByAdminSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  role: z.enum(["admin", "user", "viewer"]).default("user"),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type AdminUpdateUserDto = z.infer<typeof adminUpdateUserSchema>;
export type CreateUserByAdminDto = z.infer<typeof createUserByAdminSchema>;
