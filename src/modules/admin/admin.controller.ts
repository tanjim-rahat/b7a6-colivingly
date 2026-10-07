import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { listUsers } from "./admin.services.js";

export const listUsersController = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.query;
    const users = await listUsers(role as string | undefined);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: { users },
    });
  } catch (error) {
    const message = (error as Error).message ?? "An unexpected error occurred.";
    const statusCode = message.includes("Invalid") ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: "Failed to list users",
      message,
    });
  }
};
