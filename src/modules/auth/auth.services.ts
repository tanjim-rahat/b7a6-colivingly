import { prisma } from "../../lib/prisma.js";
import { Role } from "../../../generated/prisma/enums.js";
import bcrypt from "bcryptjs";

interface SignupInput {
  email: string;
  name?: string;
  role: Role;
  password?: string;
}

export const signupService = async (input: SignupInput) => {
  const hashedPassword = input.password
    ? await bcrypt.hash(input.password, 10)
    : undefined;

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role,
      password: hashedPassword,
    },
  });

  return user;
};
