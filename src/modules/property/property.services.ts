import { prisma } from "../../lib/prisma.js";

export interface CreatePropertyInput {
  name: string;
  address: string;
  description?: string;
  ownerId: string;
}

export const createProperty = async (input: CreatePropertyInput) => {
  return prisma.property.create({
    data: input,
  });
};
