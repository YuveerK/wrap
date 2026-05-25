import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(255),
  phone: z.string().min(10).max(15),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  streetAddress: z.string().min(1).max(150),
  postalCode: z.string().min(1).max(10),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(100),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});
