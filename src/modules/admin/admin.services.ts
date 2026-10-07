import { prisma } from "../../lib/prisma.js";
import { Role } from "../../../generated/prisma/client.js";

export const listUsers = async (role?: string) => {
  const where: any = {};

  if (role) {
    const parsedRole = Object.values(Role).find(
      (r) => r.toLowerCase() === role.toLowerCase(),
    );
    if (!parsedRole) {
      throw new Error(`Invalid role: ${role}`);
    }
    where.role = parsedRole;
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
