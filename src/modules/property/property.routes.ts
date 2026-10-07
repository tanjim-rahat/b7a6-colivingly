import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role } from "../../../generated/prisma/enums.js";
import * as propertyController from "./property.controller.js";

const router = express.Router();

// Public route
router.get("/public", propertyController.listPublicPropertiesController);

router.post(
  "/",
  authenticate,
  authorize(Role.PROVIDER),
  propertyController.createPropertyController,
);

router.get("/", authenticate, propertyController.listPropertiesController);

router.get(
  "/count",
  authenticate,
  authorize(Role.PROVIDER),
  propertyController.countPropertiesController,
);

router.get(
  "/tenants/count",
  authenticate,
  authorize(Role.PROVIDER),
  propertyController.countTenantsController,
);

export default router;
