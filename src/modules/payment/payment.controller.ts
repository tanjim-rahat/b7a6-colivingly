import { Response, Request } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { createCheckoutSessionSchema } from "./payment.validations.js";
import {
  createCheckoutSession,
  updateInvoiceFromWebhook,
} from "./payment.services.js";
import Stripe from "stripe";

type ZodError = {
  issues?: Array<{ path?: (string | number)[]; message: string }>;
};

const handleZodError = (res: Response, err: ZodError) => {
  const messages = err.issues
    ?.map((issue) => `${issue.path?.join(".") ?? "body"}: ${issue.message}`)
    .join("; ");
  res.status(400).json({
    success: false,
    error: "Validation error",
    message: messages ?? "Invalid request data",
  });
};

export const createCheckoutSessionController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { body: input } = createCheckoutSessionSchema.parse({
      body: req.body,
    });

    const session = await createCheckoutSession({
      tenantId: req.user!.userId,
      invoiceId: input.invoiceId,
    });

    res.status(200).json({
      success: true,
      message: "Checkout session created successfully",
      data: { sessionId: session.id, url: session.url },
    });
  } catch (error) {
    if ((error as ZodError)?.issues) {
      handleZodError(res, error as ZodError);
      return;
    }

    console.log("Error creating checkout session:", error);

    const message = (error as Error).message ?? "An unexpected error occurred.";
    const status =
      message.includes("not found") || message.includes("Unauthorized")
        ? 404
        : 500;

    res.status(status).json({
      success: false,
      error: "Failed to create checkout session",
      message,
    });
  }
};

export const webhookController = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const body = req.body as Stripe.Event;

  if (body.type === "checkout.session.completed") {
    const session = body.data.object as Stripe.Checkout.Session;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (paymentIntentId) {
      await updateInvoiceFromWebhook(paymentIntentId, "succeeded");
    }
  }

  res.status(200).json({ received: true });
};
