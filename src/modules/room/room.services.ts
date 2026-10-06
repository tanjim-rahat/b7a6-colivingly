import { prisma } from "../../lib/prisma.js";

export interface CreateRoomInput {
  name: string;
  description?: string;
  propertyId: string;
  rentAmount: number;
}

export const createRoom = async (input: CreateRoomInput) => {
  return prisma.room.create({
    data: input,
  });
};
