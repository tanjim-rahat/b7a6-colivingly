import { z } from "zod";

export const createPropertySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    description: z.string().optional(),
  }),
});

export const listPropertiesSchema = z.object({
  query: z.object({
    providerId: z.string().optional(),
    address: z.string().optional(),
  }),
});

