import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    roomId: z.string().min(1, "Room ID is required"),
    message: z.string().optional(),
  }),
});
