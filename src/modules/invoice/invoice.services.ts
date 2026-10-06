import { prisma } from "../../lib/prisma.js";
import { PaymentStatus } from "../../../generated/prisma/client.js";

export const listInvoicesByTenant = async (
  tenantId: string,
  status?: string,
) => {
  const where: any = { tenantId };

  if (status) {
    const parsedStatus = Object.values(PaymentStatus).find(
      (s) => s.toLowerCase() === status.toLowerCase(),
    );
    if (!parsedStatus) {
      throw new Error(`Invalid invoice status: ${status}`);
    }
    where.status = parsedStatus;
  }

  return prisma.invoice.findMany({
    where,
    include: {
      application: {
        include: { room: { include: { property: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};