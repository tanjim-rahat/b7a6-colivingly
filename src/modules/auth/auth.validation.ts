import { z } from "zod";
import { Role } from "../../../generated/prisma/client.js";

export const signupSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    name: z
      .string()
      .min(1, "Name must be at least 1 character")
      .optional(),
    role: z.nativeEnum(Role, {
      message: "Role must be one of: ADMIN, PROVIDER, TENANT",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must not exceed 128 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .max(128, "Password must not exceed 128 characters"),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z
      .string()
      .min(1, "Refresh token is required")
      .max(4096, "Refresh token is too long"),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshInput = z.infer<typeof refreshSchema>["body"];