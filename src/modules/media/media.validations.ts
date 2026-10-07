import { z } from "zod";
import { MediaType } from "../../../generated/prisma/enums.js";

export const createMediaSchema = z.object({
  body: z.object({
    type: z.enum(MediaType).optional(),
    propertyId: z.string().min(1).optional(),
    roomId: z.string().min(1).optional(),
  }),
});

export const updateMediaSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Media ID is required"),
  }),
  body: z.object({
    type: z.enum(MediaType).optional(),
    propertyId: z.string().min(1).nullable().optional(),
    roomId: z.string().min(1).nullable().optional(),
  }),
});

export const deleteMediaSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Media ID is required"),
  }),
});
