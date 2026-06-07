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

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
