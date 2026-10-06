import { z } from "zod";

export const createRoomSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    propertyId: z.string().min(1, "Property ID is required"),
  }),
});

export const addRoomToPropertySchema = z.object({
  body: z.object({
    roomId: z.string().min(1, "Room ID is required"),
    propertyId: z.string().min(1, "Property ID is required"),
  }),
});
