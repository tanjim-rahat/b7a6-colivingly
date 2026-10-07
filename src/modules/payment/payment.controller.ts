import { Response, Request } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { createCheckoutSessionSchema } from "./payment.validations.js";
import {
  createCheckoutSession,
  handleWebhookEvent,
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
  const sig = req.headers["stripe-signature"];
  if (typeof sig !== "string" || !Buffer.isBuffer(req.body)) {
    console.log("[payment/webhook] Missing signature or raw body");
    res.status(400).json({ received: false });
    return;
  }

  let event: Stripe.Event;
  try {
    event = handleWebhookEvent(req.body, sig);
  } catch (error) {
    console.log(
      "[payment/webhook] Invalid signature:",
      (error as Error).message,
    );
    res.status(400).json({ received: false });
    return;
  }

  console.log("[payment/webhook] Event:", { id: event.id, type: event.type });
  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
      console.log("[payment/webhook] Checkout session:", {
        id: session.id,
        paymentStatus: session.payment_status,
        paymentIntentId,
        invoiceId: session.metadata?.invoiceId,
      });

      if (session.payment_status !== "paid") {
        console.log(
          "[payment/webhook] Payment not yet paid; skipping invoice update",
        );
      } else if (!paymentIntentId) {
        console.log("[payment/webhook] Paid session has no payment intent ID");
        res.status(500).json({ received: false });
        return;
      } else {
        const invoice = await updateInvoiceFromWebhook(
          paymentIntentId,
          "succeeded",
          session.metadata?.invoiceId,
        );
        console.log("[payment/webhook] Invoice update:", {
          invoiceId: invoice?.id ?? null,
          status: invoice?.status ?? null,
        });
        if (!invoice) {
          res.status(500).json({ received: false });
          return;
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.log("[payment/webhook] Invoice update failed:", error);
    res.status(500).json({ received: false });
  }
};
