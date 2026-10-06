// Router for handling different API endpoints

import express from "express";

import authRouter from "./modules/auth/auth.router.js";

const router = express.Router();

// Mount the auth router at /auth
router.use("/auth", express.json(), authRouter);

export default router;
