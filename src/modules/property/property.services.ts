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

export interface ListPropertiesInput {
  providerId?: string;
  address?: string;
}

export const listProperties = async (input: ListPropertiesInput) => {
  const where: any = {};

  if (input.providerId) {
    where.ownerId = input.providerId;
  }

  if (input.address) {
    where.address = { contains: input.address, mode: "insensitive" };
  }

  return prisma.property.findMany({
    where,
    include: {
      rooms: {
        include: {
          tenants: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
};
