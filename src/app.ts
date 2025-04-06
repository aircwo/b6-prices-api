import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { config, getLogLevel, loggerConfig } from "./core/config";
import Fastify, { FastifyInstance } from "fastify";
import alertRoutes from "./feature/alert/routes/alert.routes";
import { PriceCheckService } from "./feature/alert/service/priceCheck.service";
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

  // Init price checking service after the server starts
  app.addHook("onReady", async () => {
    const priceCheckService = new PriceCheckService(app);
    await priceCheckService.initialize();

    // Store the service instance for cleanup on shutdown
    app.decorate("priceCheckService", priceCheckService);
  });

  // Cleanup on server close
  app.addHook("onClose", (instance, done) => {
    if (instance.priceCheckService) {
      instance.priceCheckService.cleanup();
    }
    done();
  });

  return app;
};

export default buildApp;
