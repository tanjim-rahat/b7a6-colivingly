import express from "express";
import * as authController from "./auth.controller.js";

const router = express.Router();

router.post("/signup", authController.signupController);

export default router;
