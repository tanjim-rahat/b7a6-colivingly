import { Response } from "express";
import { ZodError } from "zod";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { listUsers, updateUserStatus } from "./admin.services.js";
import { updateUserStatusSchema } from "./admin.validations.js";

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

export const updateUserStatusController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { params, body } = updateUserStatusSchema.parse({
      params: req.params,
      body: req.body,
    });
    const user = await updateUserStatus(params.id, body.status);

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: { user },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
      });
      return;
    }

    if ((error as { code?: string }).code === "P2025") {
      res.status(404).json({
        success: false,
        error: "User not found",
        message: "User not found.",
      });
      return;
    }

    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};
