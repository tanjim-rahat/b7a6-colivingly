import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role } from "../../../generated/prisma/client.js";
import * as applicationController from "./application.controller.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  applicationController.createApplicationController,
);

router.get(
  "/provider",
  authenticate,
  authorize(Role.PROVIDER),
  applicationController.listApplicationsByProviderController,
);

export default router;
