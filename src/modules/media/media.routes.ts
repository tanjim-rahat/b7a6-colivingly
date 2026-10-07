import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role } from "../../../generated/prisma/client.js";
import * as mediaController from "./media.controller.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(Role.PROVIDER),
  mediaController.upload.single("file"),
  mediaController.createMediaController,
);

router.patch(
  "/:id",
  authenticate,
  authorize(Role.PROVIDER),
  mediaController.upload.single("file"),
  mediaController.updateMediaController,
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.PROVIDER),
  mediaController.deleteMediaController,
);

export default router;
