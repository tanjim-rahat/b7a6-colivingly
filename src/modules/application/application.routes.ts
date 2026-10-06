import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import * as applicationController from "./application.controller.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  applicationController.createApplicationController,
);

export default router;
