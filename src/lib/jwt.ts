import crypto from "node:crypto";

import jwt, { SignOptions } from "jsonwebtoken";
import config from "../config/index.js";
import bcrypt from "bcryptjs";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  jti: string;
}

const signToken = (
  payload: object,
  secret: string,
  options: SignOptions,
): string => {
  return jwt.sign(payload, secret, options);
};

const verifyToken = <T = JwtPayload>(
  token: string,
  secret: string,
): T | null => {
  try {
    return jwt.verify(token, secret) as T;
  } catch {
    return null;
  }
};

export const generateTokens = (userId: string, email: string, role: string) => {
  const accessToken = signToken(
    { userId, email, role },
    config.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: config.ACCESS_TOKEN_EXPIRES_IN as Parameters<
        typeof jwt.sign
      >[2]["expiresIn"],
    },
  );

  const rawRefreshToken = crypto.randomBytes(64).toString("hex");
  const hashedRefreshToken = bcrypt.hashSync(rawRefreshToken, 10);

  const refreshToken = signToken(
    { userId, email, role, jti: crypto.randomUUID() },
    config.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: config.REFRESH_TOKEN_EXPIRES_IN as Parameters<
        typeof jwt.sign
      >[2]["expiresIn"],
    },
  );

  return {
    accessToken,
    refreshToken,
    hashedRefreshToken,
  };
};

export const verifyAccessToken = (token: string): JwtPayload | null =>
  verifyToken(token, config.ACCESS_TOKEN_SECRET!);

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null =>
  verifyToken(token, config.REFRESH_TOKEN_SECRET!);

export { bcrypt };
