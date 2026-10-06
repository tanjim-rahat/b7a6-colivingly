import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { createPropertySchema, listPropertiesSchema } from "./property.validations.js";
import { createProperty, listProperties } from "./property.services.js";

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

