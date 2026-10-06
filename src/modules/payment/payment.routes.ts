import express, { Request } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import * as paymentController from "./payment.controller.js";

const router = express.Router();

router.post(
  "/checkout",
  authenticate,
  paymentController.createCheckoutSessionController,
);

// Stripe webhook — raw body, no JSON parser, no auth
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.webhookController,
);

export default router;
