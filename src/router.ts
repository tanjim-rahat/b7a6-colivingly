// Router for handling different API endpoints

import express from "express";

import authRouter from "./modules/auth/auth.router.js";
import propertyRouter from "./modules/property/property.routes.js";
import roomRouter from "./modules/room/room.routes.js";
import applicationRouter from "./modules/application/application.routes.js";
import paymentRouter from "./modules/payment/payment.routes.js";

const router = express.Router();

// Mount the auth router at /auth
router.use("/auth", express.json(), authRouter);

// Mount the property router at /properties
router.use("/properties", express.json(), propertyRouter);

// Mount the room router at /rooms
router.use("/rooms", express.json(), roomRouter);

// Mount the application router at /applications
router.use("/applications", express.json(), applicationRouter);

// Mount the payment router at /payment
router.use("/payment", express.json(), paymentRouter);

export default router;
