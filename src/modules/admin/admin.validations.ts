import { z } from "zod";

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPEND"]),
  }),
});
