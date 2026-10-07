import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role } from "../../../generated/prisma/client.js";
import * as adminController from "./admin.controller.js";

const router = express.Router();

router.get(
  "/users",
  authenticate,
  authorize(Role.ADMIN),
  adminController.listUsersController,
);

export default router;
