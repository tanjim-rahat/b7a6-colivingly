import { Response } from "express";
import multer from "multer";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import {
  createMediaSchema,
  deleteMediaSchema,
  updateMediaSchema,
} from "./media.validations.js";
import {
  createMedia,
  deleteMedia,
  destroyFile,
  findMediaById,
  updateMedia,
  uploadFile,
} from "./media.services.js";

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

// Store uploaded files in memory so we can stream them to Cloudinary
export const upload = multer({ storage: multer.memoryStorage() });

export const createMediaController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "File is required.",
      });
      return;
    }

    const { body: input } = createMediaSchema.parse({ body: req.body });

    const uploaded = await uploadFile(req.file.buffer, req.file.mimetype);

    const media = await createMedia({
      url: uploaded.url,
      publicId: uploaded.publicId,
      type: input.type ?? uploaded.type,
      propertyId: input.propertyId,
      roomId: input.roomId,
    });

    res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      data: { media },
    });
  } catch (error) {
    if ((error as ZodError)?.issues) {
      handleZodError(res, error as ZodError);
      return;
    }

    console.error("Error creating media:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};

export const updateMediaController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { params, body } = updateMediaSchema.parse({
      params: req.params,
      body: req.body,
    });

    const existing = await findMediaById(params.id);

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Media not found",
        message: "Media not found.",
      });
      return;
    }

    let media;
    if (req.file) {
      // Replace the stored asset: remove the old one and upload the new file
      if (existing.publicId) {
        await destroyFile(existing.publicId, existing.type);
      }
      const uploaded = await uploadFile(req.file.buffer, req.file.mimetype);

      media = await updateMedia(params.id, {
        ...body,
        url: uploaded.url,
        publicId: uploaded.publicId,
        type: body.type ?? uploaded.type,
      });
    } else {
      media = await updateMedia(params.id, body);
    }

    res.status(200).json({
      success: true,
      message: "Media updated successfully",
      data: { media },
    });
  } catch (error) {
    if ((error as ZodError)?.issues) {
      handleZodError(res, error as ZodError);
      return;
    }

    console.error("Error updating media:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};

export const deleteMediaController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { params } = deleteMediaSchema.parse({ params: req.params });

    const existing = await findMediaById(params.id);

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Media not found",
        message: "Media not found.",
      });
      return;
    }

    if (existing.publicId) {
      await destroyFile(existing.publicId, existing.type);
    }

    await deleteMedia(params.id);

    res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    if ((error as ZodError)?.issues) {
      handleZodError(res, error as ZodError);
      return;
    }

    console.error("Error deleting media:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred.",
    });
  }
};
