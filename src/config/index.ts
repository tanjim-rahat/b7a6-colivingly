import dotenv from "dotenv";

dotenv.config();

type Config = {
  DATABASE_URL: string | undefined;
};

const config: Config = {
  DATABASE_URL: process.env.DATABASE_URL,
};

export default config;
