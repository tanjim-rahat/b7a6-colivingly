import express from "express";
import * as authController from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role } from "../../../generated/prisma/client.js";

const router = express.Router();

// Public routes
router.post("/signup", authController.signupController);
router.post("/login", authController.loginController);
router.post("/refresh", authController.refreshController);

// Protected routes
router.post("/logout", authenticate, authController.logoutController);
router.get("/whoami", authenticate, authController.whoamiController);

// Example protected route requiring specific role
router.get("/admin-only", authenticate, authorize(Role.ADMIN), (req, res) => {
  res.json({ success: true, message: "Admin access granted" });
});

export default router;
