import { prisma } from "../../lib/prisma.js";

export interface CreateApplicationInput {
  tenantId: string;
  roomId: string;
  message?: string;
}

export const createApplication = async (input: CreateApplicationInput) => {
  const room = await prisma.room.findUnique({
    where: { id: input.roomId },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  return prisma.application.create({
    data: {
      tenantId: input.tenantId,
      roomId: input.roomId,
      message: input.message,
    },
  });
};

export const listApplicationsByProvider = async (providerId: string) => {
  return prisma.application.findMany({
    where: {
      room: {
        property: {
          ownerId: providerId,
        },
      },
    },
    include: {
      tenant: { select: { id: true, email: true, name: true } },
      room: {
        include: {
          property: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateApplicationStatus = async (
  applicationId: string,
  providerId: string,
  status: "APPROVED" | "REJECTED",
  message?: string,
) => {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      room: { property: { ownerId: providerId } },
    },
  });

  if (!application) {
    throw new Error("Application not found or you do not have access to it.");
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: { status, message },
    include: {
      tenant: { select: { id: true, email: true, name: true } },
      room: { include: { property: true } },
    },
  });
};
