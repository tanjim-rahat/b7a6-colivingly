import { prisma } from "../../lib/prisma.js";
import { Role } from "../../../generated/prisma/enums.js";
import bcrypt from "bcryptjs";
import { generateTokens, verifyRefreshToken } from "../../lib/jwt.js";

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

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const loginService = async (input: LoginInput): Promise<LoginResult> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    const error = new Error("Invalid email or password") as Error & { code?: string };
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const isValidPassword = user.password
    ? await bcrypt.compare(input.password, user.password)
    : false;

  if (!isValidPassword) {
    const error = new Error("Invalid email or password") as Error & { code?: string };
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const { accessToken, refreshToken, hashedRefreshToken } = generateTokens(
    user.id,
    user.email,
    user.role,
  );

  // Store hashed refresh token in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });

  const { password: _password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

export interface RefreshInput {
  refreshToken: string;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export const refreshTokenService = async (
  input: RefreshInput,
): Promise<RefreshResult> => {
  const payload = verifyRefreshToken(input.refreshToken);

  if (!payload) {
    const error = new Error("Invalid or expired refresh token") as Error & { code?: string };
    error.code = "INVALID_REFRESH_TOKEN";
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || !user.refreshToken) {
    const error = new Error("Invalid or expired refresh token") as Error & { code?: string };
    error.code = "INVALID_REFRESH_TOKEN";
    throw error;
  }

  const isValid = await bcrypt.compare(input.refreshToken, user.refreshToken);

  if (!isValid) {
    const error = new Error("Invalid or expired refresh token") as Error & { code?: string };
    error.code = "INVALID_REFRESH_TOKEN";
    throw error;
  }

  const { accessToken, refreshToken, hashedRefreshToken } = generateTokens(
    user.id,
    user.email,
    user.role,
  );

  // Rotate: store new hashed refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });

  return { accessToken, refreshToken };
};

export type LogoutServiceResult = { success: true; message: string };

export const logoutService = async (userId: string): Promise<LogoutServiceResult> => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  return { success: true, message: "Logged out successfully" };
};

export type WhoamiResult = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export const whoAmIService = async (userId: string): Promise<WhoamiResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });

  if (!user) {
    const error = new Error("User not found") as Error & { code?: string };
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  return user;
};
