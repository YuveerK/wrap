import { z } from "zod";

export const updateUserSchema = z.object({
  email: z.string().email().max(255).optional(),
  phone: z.string().min(10).max(15).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  streetAddress: z.string().min(1).max(150).optional(),
  postalCode: z.string().min(1).max(10).optional(),
  profilePhoto: z.string().url().optional(),
});
