import { FastifyRequest, FastifyReply } from "fastify";
import { alertService } from "../service/alert.service";
import {
  CreateAlertRequest,
  AlertParamsRequest,
  UpdateAlertRequest,
} from "../model/interface/request.interface";

export class AlertController {
  /**
   * Create a new alert
   * POST /prices-api/v1/alerts/
   */
  async createAlert(
    request: FastifyRequest<CreateAlertRequest>,
    reply: FastifyReply,
  ) {
    try {
      // Create alert (validation already done by Fastify schema)
      const alert = await alertService.createAlert(request.body);

      return reply.code(201).send({
        success: true,
        message: "Price alert has been set successfully.",
        data: alert,
      });
    } catch (error) {
      request.log.error(error, "Error creating alert");
      return reply.code(500).send({
        success: false,
        message: "An error occurred while creating the alert.",
      });
    }
  }

  /**
   * Get all alerts
   * GET /prices-api/v1/alerts/
   */
  async getAllAlerts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const alerts = await alertService.getAllAlerts();

      return reply.code(200).send({
        success: true,
        count: alerts.length,
        data: alerts,
      });
    } catch (error) {
      request.log.error(error, "Error fetching alerts");
      return reply.code(500).send({
        success: false,
        message: "An error occurred while fetching alerts.",
      });
    }
  }

  /**
   * Get alert by ID
   * GET /prices-api/v1/alerts/:id
   */
  async getAlertById(
    request: FastifyRequest<AlertParamsRequest>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const alert = await alertService.getAlertById(id);

      if (!alert) {
        return reply.code(404).send({
          success: false,
          message: "Alert not found.",
        });
      }

      return reply.code(200).send({
        success: true,
        data: alert,
      });
    } catch (error) {
      request.log.error(error, "Error fetching alert");
      return reply.code(500).send({
        success: false,
        message: "An error occurred while fetching the alert.",
      });
    }
  }

  /**
   * Update an alert
   * PUT /prices-api/v1/alerts/:id
   */
  async updateAlert(
    request: FastifyRequest<UpdateAlertRequest>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;

      // Update alert (validation already done by Fastify schema)
      const alert = await alertService.updateAlert(id, request.body);

      if (!alert) {
        return reply.code(404).send({
          success: false,
          message: "Alert not found.",
        });
      }

      return reply.code(200).send({
        success: true,
        message: "Alert updated successfully.",
        data: alert,
      });
    } catch (error) {
      request.log.error(error, "Error updating alert");
      return reply.code(500).send({
        success: false,
        message: "An error occurred while updating the alert.",
      });
    }
  }

  /**
   * Delete an alert
   * DELETE /prices-api/v1/alerts/:id
   */
  async deleteAlert(
    request: FastifyRequest<AlertParamsRequest>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const result = await alertService.deleteAlert(id);

      if (!result) {
        return reply.code(404).send({
          success: false,
          message: "Alert not found or already deleted.",
        });
      }

      return reply.code(200).send({
        success: true,
        message: "Alert deleted successfully.",
      });
    } catch (error) {
      request.log.error(error, "Error deleting alert");
      return reply.code(500).send({
        success: false,
        message: "An error occurred while deleting the alert.",
      });
    }
  }
}

export const alertController = new AlertController();
