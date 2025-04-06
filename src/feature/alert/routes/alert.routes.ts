import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { alertController } from "../controller/alert.controller";
import {
  createAlertSchema,
  updateAlertSchema,
  alertParamsSchema,
} from "../../../core/utils/schemas";
import { apiKeyCheck } from "../../../core/utils/authHook";

const alertRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // add api key check middleware
  fastify.addHook("preHandler", apiKeyCheck);

  // Create a new alert
  fastify.post("/", { schema: createAlertSchema }, alertController.createAlert);

  // Get all alerts
  fastify.get("/", alertController.getAllAlerts);

  // Get a specific alert
  fastify.get(
    "/:id",
    { schema: { params: alertParamsSchema } },
    alertController.getAlertById,
  );

  // following are not required by assignment but included for completeness
  // Update an alert
  fastify.put(
    "/:id",
    { schema: { ...updateAlertSchema, params: alertParamsSchema } },
    alertController.updateAlert,
  );

  // Delete an alert
  fastify.delete(
    "/:id",
    { schema: { params: alertParamsSchema } },
    alertController.deleteAlert,
  );
};

export default alertRoutes;
