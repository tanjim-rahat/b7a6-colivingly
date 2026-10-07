import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import {
  createPropertySchema,
  listPropertiesSchema,
} from "./property.validations.js";
import { createProperty, listProperties, getProperty, countProperties, countTenants } from "./property.services.js";

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

export const createPropertyController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { body: input } = createPropertySchema.parse({ body: req.body });

    console.log(req.user);

    const property = await createProperty({
      ...input,
      ownerId: req.user!.userId,
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: { property },
    });
  } catch (error) {
    if ((error as ZodError)?.issues) {
      handleZodError(res, error as ZodError);
      return;
    }

    console.error("Error creating property:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};

export const listPropertiesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { query: input } = listPropertiesSchema.parse({ query: req.query });

    const properties = await listProperties(input);

    res.status(200).json({
      success: true,
      message: "Properties retrieved successfully",
      data: { properties },
    });
  } catch (error) {
    if ((error as ZodError)?.issues) {
      handleZodError(res, error as ZodError);
      return;
    }

    console.error("Error listing properties:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};

export const listPublicPropertiesController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const properties = await listProperties({});

    res.status(200).json({
      success: true,
      message: "Properties retrieved successfully",
      data: { properties },
    });
  } catch (error) {
    console.error("Error listing public properties:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};

export const getPropertyController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const property = await getProperty(req.params.id as string);

    res.status(200).json({
      success: true,
      message: "Property retrieved successfully",
      data: { property },
    });
  } catch (error) {
    const message = (error as Error).message ?? "An unexpected error occurred.";
    const status = message.includes("not found") ? 404 : 500;

    res.status(status).json({
      success: false,
      error: "Failed to get property",
      message,
    });
  }
};

export const countPropertiesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const count = await countProperties(req.user!.userId);

    res.status(200).json({
      success: true,
      message: "Property count retrieved successfully",
      data: { count },
    });
  } catch (error) {
    console.error("Error counting properties:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};

export const countTenantsController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const count = await countTenants(req.user!.userId);

    res.status(200).json({
      success: true,
      message: "Tenant count retrieved successfully",
      data: { count },
    });
  } catch (error) {
    console.error("Error counting tenants:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};
