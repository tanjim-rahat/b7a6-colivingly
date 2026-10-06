import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { prisma } from "../../lib/prisma.js";
import { createRoomSchema } from "./room.validations.js";
import { createRoom } from "./room.services.js";

type ZodError = {
  issues?: Array<{ path?: (string | number)[]; message: string }>;
};

const handleZodError = (res: Response, err: ZodError) => {
  const messages = err.issues
    ?.map((issue) => `${issue.path?.join(".") ?? "body"}: ${issue.message}`)
    .join("; ");
  res.status(400).json({
    success: false,
    error: "Validation error",
    message: messages ?? "Invalid request data",
  });
};

export const createRoomController = async (req: AuthRequest, res: Response) => {
  try {
    const { body: input } = createRoomSchema.parse({ body: req.body });

    const property = await prisma.property.findUnique({
      where: { id: input.propertyId },
    });

    if (!property || property.ownerId !== req.user!.userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You do not own this property.",
      });
      return;
    }

    const room = await createRoom(input);

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: { room },
    });
  } catch (error) {
    if ((error as ZodError)?.issues) {
      handleZodError(res, error as ZodError);
      return;
    }

    console.error("Error creating room:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};
