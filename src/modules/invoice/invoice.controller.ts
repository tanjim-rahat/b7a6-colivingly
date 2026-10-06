import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { listInvoicesByTenant } from "./invoice.services.js";

export const listInvoicesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { status } = req.query;
    const invoices = await listInvoicesByTenant(req.user!.userId, status as string | undefined);

    res.status(200).json({
      success: true,
      message: "Invoices retrieved successfully",
      data: { invoices },
    });
  } catch (error) {
    const message = (error as Error).message ?? "An unexpected error occurred.";
    const statusCode = message.includes("Invalid") ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: "Failed to list invoices",
      message,
    });
  }
};