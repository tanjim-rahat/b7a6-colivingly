import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { prisma } from "../../lib/prisma.js";
import {
  createApplicationSchema,
  updateApplicationSchema,
} from "./application.validations.js";
import {
  createApplication,
  getApplication,
  listApplicationsByProvider,
  listApplicationsByTenant,
  updateApplicationStatus,
} from "./application.services.js";

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

export const createApplicationController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { body: input } = createApplicationSchema.parse({ body: req.body });

    const existing = await prisma.application.findFirst({
      where: { tenantId: req.user!.userId, roomId: input.roomId },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        error: "Already applied",
        message: "You have already applied to this room.",
      });
      return;
    }

    const application = await createApplication({
      tenantId: req.user!.userId,
      ...input,
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: { application },
    });
  } catch (error) {
    if ((error as ZodError)?.issues) {
      handleZodError(res, error as ZodError);
      return;
    }

    console.error("Error creating application:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};

export const getApplicationController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const application = await getApplication(
      req.params.id as string,
      req.user!.userId,
      req.user!.role,
    );

    res.status(200).json({
      success: true,
      message: "Application retrieved successfully",
      data: { application },
    });
  } catch (error) {
    const message = (error as Error).message ?? "An unexpected error occurred.";
    const status = message.includes("not found") ? 404 : 500;

    res.status(status).json({
      success: false,
      error: "Failed to get application",
      message,
    });
  }
};

export const listApplicationsByTenantController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const applications = await listApplicationsByTenant(req.user!.userId);

    res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      data: { applications },
    });
  } catch (error) {
    console.error("Error listing applications:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};

export const listApplicationsByProviderController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const applications = await listApplicationsByProvider(req.user!.userId);

    res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      data: { applications },
    });
  } catch (error) {
    console.error("Error listing applications:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};

export const updateApplicationStatusController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { params, body: input } = updateApplicationSchema.parse({
      params: req.params,
      body: req.body,
    });

    const application = await updateApplicationStatus(
      params.id,
      req.user!.userId,
      input.status,
      input.message,
    );

    res.status(200).json({
      success: true,
      message: `Application ${input.status.toLowerCase()} successfully`,
      data: { application },
    });
  } catch (error) {
    if ((error as ZodError)?.issues) {
      handleZodError(res, error as ZodError);
      return;
    }

    const message = (error as Error).message ?? "An unexpected error occurred.";
    const status = message.includes("not found") ? 404 : 500;

    res.status(status).json({
      success: false,
      error: "Failed to update application",
      message,
    });
  }
};
