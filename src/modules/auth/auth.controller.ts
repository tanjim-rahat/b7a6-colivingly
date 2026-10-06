import { Request, Response } from "express";
import { signupService } from "./auth.services.js";

export const signupController = async (req: Request, res: Response) => {
  try {
    const { email, name, role, password } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: "Email is required",
        message: "Please provide an email address.",
      });
      return;
    }

    if (!password) {
      res.status(400).json({
        success: false,
        error: "Password is required",
        message: "Please provide a password.",
      });
      return;
    }

    const user = await signupService({ email, name, role, password });

    // Destructure to exclude password from response
    const { password: _password, ...userWithoutPassword } = user as Record<string, unknown> & { password?: string };

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    // Prisma P2002 = unique constraint violation (duplicate email)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      res.status(409).json({
        success: false,
        error: "Email already registered",
        message: "This email is already registered.",
      });
      return;
    }

    console.error("Error in signupController:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};
