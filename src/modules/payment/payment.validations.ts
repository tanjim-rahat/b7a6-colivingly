import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  body: z.object({
    invoiceId: z.string().min(1, "Invoice ID is required"),
  }),
});

export const paymentWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.any(),
});
