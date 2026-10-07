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
  STRIPE_SECRET_KEY: string | undefined;
  STRIPE_WEBHOOK_SECRET: string | undefined;
  CLOUDINARY_CLOUD_NAME: string | undefined;
  CLOUDINARY_API_KEY: string | undefined;
  CLOUDINARY_API_SECRET: string | undefined;
  SERVER_URL: string;
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
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  SERVER_URL: process.env.SERVER_URL ?? "http://localhost:3000",
};

export default config;
