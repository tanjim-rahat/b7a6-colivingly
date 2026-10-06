import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import config from "../config/index.js";

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

export const getCookieName = () => config.COOKIE_NAME;

/**
 * Extracts the access token from either:
 * 1. Authorization: Bearer <token> header
 * 2. Cookie (configured name)
 */
export const extractAccessToken = (req: AuthRequest): string | null => {
  // First check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // Fallback to cookie
  const cookies = req.cookies;
  if (cookies && cookies[config.COOKIE_NAME]) {
    return cookies[config.COOKIE_NAME] as string;
  }

  return null;
};

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = extractAccessToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Access token is required.",
      });
      return;
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
        message: "Please log in again to continue.",
      });
      return;
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred during authentication.",
    });
  }
};
