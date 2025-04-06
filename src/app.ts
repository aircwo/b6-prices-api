import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { config, getLogLevel, loggerConfig } from "./core/config";
import Fastify, { FastifyInstance } from "fastify";
import alertRoutes from "./feature/alert/routes/alert.routes";
import { DEFAULT_ENVIRONMENT } from "./core/utils/constants";

const BASE_URL_V1 = "/prices-api/v1";

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

  app.get(BASE_URL_V1 + "/health", async () => {
    return { status: "OK", message: "API is up and running" };
  });

  app.register(alertRoutes, { prefix: BASE_URL_V1 + "/alerts" });
  
  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ message: "Resource not found" });
  });

  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode || 500;
    request.log.error(error);

    reply.status(statusCode).send({
      success: false,
      message: error.message || "Internal Server Error",
      stack: config.nodeEnv === DEFAULT_ENVIRONMENT ? error.stack : undefined,
    });
  });

  return app;
};

export default buildApp;
