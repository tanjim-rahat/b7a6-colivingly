import { Request, Response } from "express";
import {
  signupService,
  loginService,
  refreshTokenService,
  logoutService,
  whoAmIService,
} from "./auth.services.js";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import config from "../../config/index.js";

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

    const { password: _password, ...userWithoutPassword } = user as Record<string, unknown> & {
      password?: string;
    };

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user: userWithoutPassword },
    });
  } catch (error) {
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

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required",
        message: "Please provide both email and password.",
      });
      return;
    }

    const result = await loginService({ email, password });

    // Set access token as HTTP-only cookie
    res.cookie(config.COOKIE_NAME, result.accessToken, {
      httpOnly: config.COOKIE_HTTP_ONLY,
      secure: config.COOKIE_SECURE,
      maxAge: config.COOKIE_MAX_AGE,
      sameSite: config.COOKIE_SECURE ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "INVALID_CREDENTIALS"
    ) {
      res.status(401).json({
        success: false,
        error: "Invalid credentials",
        message: "Invalid email or password.",
      });
      return;
    }

    console.error("Error in loginController:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};

export const refreshController = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: "Refresh token is required",
        message: "Please provide a refresh token.",
      });
      return;
    }

    const result = await refreshTokenService({ refreshToken });

    // Update access token cookie with new token
    res.cookie(config.COOKIE_NAME, result.accessToken, {
      httpOnly: config.COOKIE_HTTP_ONLY,
      secure: config.COOKIE_SECURE,
      maxAge: config.COOKIE_MAX_AGE,
      sameSite: config.COOKIE_SECURE ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      data: result,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "INVALID_REFRESH_TOKEN"
    ) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired refresh token",
        message: "Please log in again to continue.",
      });
      return;
    }

    console.error("Error in refreshController:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};

export const logoutController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required.",
      });
      return;
    }

    const result = await logoutService(req.user.userId);

    // Clear access token cookie
    res.clearCookie(config.COOKIE_NAME);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in logoutController:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};

export const whoamiController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required.",
      });
      return;
    }

    const user = await whoAmIService(req.user.userId);

    res.status(200).json({
      success: true,
      message: "User information retrieved successfully",
      data: { user },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "USER_NOT_FOUND"
    ) {
      res.status(404).json({
        success: false,
        error: "User not found",
        message: "The authenticated user could not be found.",
      });
      return;
    }

    console.error("Error in whoamiController:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};
