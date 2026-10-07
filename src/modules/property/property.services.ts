import { prisma } from "../../lib/prisma.js";
import { Role } from "../../../generated/prisma/enums.js";

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
      media: true,
      rooms: {
        include: {
          media: true,
          tenants: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
};

export const getProperty = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      media: true,
      rooms: {
        include: {
          media: true,
          tenants: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  return property;
};

export const countProperties = (providerId: string) =>
  prisma.property.count({ where: { ownerId: providerId } });

export const countTenants = (providerId: string) =>
  prisma.user.count({
    where: {
      role: Role.TENANT,
      rooms: { some: { property: { ownerId: providerId } } },
    },
  });
