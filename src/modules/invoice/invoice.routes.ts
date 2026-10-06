import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role } from "../../../generated/prisma/client.js";
import * as invoiceController from "./invoice.controller.js";

const router = express.Router();

router.get(
  "/tenant",
  authenticate,
  authorize(Role.TENANT),
  invoiceController.listInvoicesController,
);

export default router;