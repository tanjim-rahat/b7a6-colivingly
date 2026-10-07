import { prisma } from "../../lib/prisma.js";
import {
  ApplicationStatus,
  PaymentStatus,
} from "../../../generated/prisma/client.js";

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

export const listApplicationsByTenant = async (tenantId: string) => {
  return prisma.application.findMany({
    where: { tenantId },
    include: {
      room: { include: { property: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getApplication = async (
  applicationId: string,
  userId: string,
  userRole: string,
) => {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      ...(userRole === "TENANT"
        ? { tenantId: userId }
        : { room: { property: { ownerId: userId } } }),
    },
    include: {
      tenant: { select: { id: true, email: true, name: true } },
      room: { include: { property: true } },
      invoice: {
        select: { id: true, amount: true, dueDate: true, status: true },
      },
    },
  });

  if (!application) {
    throw new Error("Application not found or you do not have access to it.");
  }

  return application;
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
    include: {
      room: true,
      tenant: true,
    },
  });

  if (!application) {
    throw new Error("Application not found or you do not have access to it.");
  }

  if (application.status === ApplicationStatus.APPROVED) {
    throw new Error("Application already approved");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id: applicationId },
      data: { status, message },
      include: {
        tenant: { select: { id: true, email: true, name: true } },
        room: { include: { property: true } },
      },
    });

    if (status === ApplicationStatus.APPROVED && updated.room.rentAmount > 0) {
      console.log(
        "Invoice creation logic triggered for application:",
        updated.id,
      );

      const existingInvoice = await tx.invoice.findFirst({
        where: { applicationId },
      });

      if (!existingInvoice) {
        await tx.invoice.create({
          data: {
            tenantId: updated.tenantId,
            applicationId: updated.id,
            amount: updated.room.rentAmount,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: PaymentStatus.PENDING,
          },
        });
      }
    }

    return updated;
  });
};
