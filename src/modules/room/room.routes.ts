import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role } from "../../../generated/prisma/client.js";
import * as roomController from "./room.controller.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(Role.PROVIDER),
  roomController.createRoomController,
);

export default router;
