import dotenv from "dotenv";

dotenv.config();

type Config = {
  DATABASE_URL: string | undefined;
  ACCESS_TOKEN_SECRET: string | undefined;
  REFRESH_TOKEN_SECRET: string | undefined;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  COOKIE_NAME: string;
  COOKIE_MAX_AGE: number;
  COOKIE_HTTP_ONLY: boolean;
  COOKIE_SECURE: boolean;
};

const config: Config = {
  DATABASE_URL: process.env.DATABASE_URL,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",
  COOKIE_NAME: process.env.COOKIE_NAME ?? "access_token",
  COOKIE_MAX_AGE: parseInt(process.env.COOKIE_MAX_AGE ?? "900000"), // 15 minutes in ms
  COOKIE_HTTP_ONLY: process.env.COOKIE_HTTP_ONLY === "true",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
};

export default config;
