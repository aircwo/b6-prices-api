import dotenv from "dotenv";
import pino from "pino";
import "reflect-metadata";
import { DEFAULT_ENVIRONMENT } from "../utils/constants";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  logger: pino.Logger;
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
  logger: pino({
    ...loggerConfig,
    level: getLogLevel(),
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
};
