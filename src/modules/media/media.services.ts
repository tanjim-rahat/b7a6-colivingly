import { cloudinary } from "../../lib/cloudinary.js";
import { prisma } from "../../lib/prisma.js";
import { MediaType } from "../../../generated/prisma/client.js";

export interface UploadResult {
  url: string;
  publicId: string;
  type: MediaType;
}

export const uploadFile = (
  buffer: Buffer,
  mimetype: string,
): Promise<UploadResult> =>
  new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith("video") ? "video" : "image";

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: "colivingly" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          type: resourceType === "video" ? MediaType.VIDEO : MediaType.IMAGE,
        });
      },
    );

    stream.end(buffer);
  });

export const destroyFile = (publicId: string, type: MediaType) =>
  cloudinary.uploader.destroy(publicId, {
    resource_type: type === MediaType.VIDEO ? "video" : "image",
  });

export interface CreateMediaInput {
  url: string;
  publicId: string;
  type: MediaType;
  propertyId?: string;
  roomId?: string;
}

export const createMedia = (input: CreateMediaInput) =>
  prisma.media.create({
    data: {
      url: input.url,
      publicId: input.publicId,
      type: input.type,
      propertyId: input.propertyId,
      roomId: input.roomId,
    },
  });

export const findMediaById = (id: string) =>
  prisma.media.findUnique({ where: { id } });

export interface UpdateMediaInput {
  url?: string;
  publicId?: string;
  type?: MediaType;
  propertyId?: string | null;
  roomId?: string | null;
}

export const updateMedia = (id: string, input: UpdateMediaInput) =>
  prisma.media.update({ where: { id }, data: input });

export const deleteMedia = (id: string) =>
  prisma.media.delete({ where: { id } });
