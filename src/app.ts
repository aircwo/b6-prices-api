import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { config, getLogLevel, loggerConfig } from "./core/config";
import Fastify, { FastifyInstance } from "fastify";

const buildApp = (): FastifyInstance => {
  const app = Fastify({
    logger: {
      ...loggerConfig,
      level: getLogLevel(config.nodeEnv),
    },
  });

  // Register security plugins
  app.register(cors);
  app.register(helmet);

  app.get("/health", async () => {
    return { status: "OK", message: "API is up and running" };
  });

  return app;
};

export default buildApp;
