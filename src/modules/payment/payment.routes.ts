import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role } from "../../../generated/prisma/client.js";
import * as paymentController from "./payment.controller.js";

const router = express.Router();

router.post(
  "/checkout",
  express.json(),
  authenticate,
  authorize(Role.TENANT),
  paymentController.createCheckoutSessionController,
);

// Stripe webhook — raw body, no JSON parser, no auth
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.webhookController,
);

export default router;
