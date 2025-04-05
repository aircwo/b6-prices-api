import dotenv from "dotenv";
import pino from "pino";
import "reflect-metadata";
import { DEFAULT_ENVIRONMENT } from "../utils/constants";

dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
}

interface Config {
  port: number;
  nodeEnv: string;
  database: DatabaseConfig;
  logger: pino.Logger;
  apiKey?: string;
}

export const loggerConfig = {
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
    },
  },
};

export const getLogLevel = (
  nodeEnv: string = process.env.NODE_ENV || DEFAULT_ENVIRONMENT,
) => {
  return (
    process.env.LOG_LEVEL ||
    (nodeEnv === DEFAULT_ENVIRONMENT ? "debug" : "info")
  );
};

export const config: Config = {
  port: isNaN(parseInt(process.env.PORT!, 10))
    ? 3000
    : parseInt(process.env.PORT!, 10),
  nodeEnv: process.env.NODE_ENV || DEFAULT_ENVIRONMENT,
  database: {
    host: process.env.DB_HOST || "localhost",
    port: isNaN(parseInt(process.env.DB_PORT!, 10))
      ? 5432
      : parseInt(process.env.DB_PORT!, 10),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    name: process.env.DB_NAME || "b6-prices-api-db",
  },
  logger: pino({
    ...loggerConfig,
    level: getLogLevel(),
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
  apiKey: process.env.API_KEY || undefined,
};
