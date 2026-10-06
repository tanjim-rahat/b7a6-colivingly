import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";

type AllowedRoles = string | string[];

export const authorize = (...allowedRoles: AllowedRoles[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required.",
      });
      return;
    }

    const userRole = req.user.role;
    const hasAccess = allowedRoles.some((role) => {
      if (typeof role === "string") return userRole === role;
      return role.includes(userRole);
    });

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You do not have permission to perform this action.",
      });
      return;
    }

    next();
  };
};
