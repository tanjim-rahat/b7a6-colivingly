// Router for handling different API endpoints

import express from "express";

import authRouter from "./modules/auth/auth.router.js";
import propertyRouter from "./modules/property/property.routes.js";
import roomRouter from "./modules/room/room.routes.js";

const router = express.Router();

// Mount the auth router at /auth
router.use("/auth", express.json(), authRouter);

// Mount the property router at /properties
router.use("/properties", express.json(), propertyRouter);

// Mount the room router at /rooms
router.use("/rooms", express.json(), roomRouter);

export default router;
