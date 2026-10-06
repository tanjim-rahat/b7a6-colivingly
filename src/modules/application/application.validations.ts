import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    roomId: z.string().min(1, "Room ID is required"),
    message: z.string().optional(),
  }),
});

export const updateApplicationSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Application ID is required"),
  }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    message: z.string().optional(),
  }),
});
