import { alertService } from "./alert.service";
import { Alert } from "../model/entity/alert.entity";
import { dataSource } from "../../../core/config/database";
import { AlertRepository } from "../repository/alert.repository";
import { FastifyInstance } from "fastify";
import { calculateNextCheckDelay } from "../../../core/utils/calculateNextCheckDelay";

export class PriceCheckService {
  private fastify: FastifyInstance;
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Initialise the price checking service
   */
  async initialize() {
    this.fastify.log.info("Initialising price checking service");

    // Schedule checks for all active alerts
    const alerts = await AlertRepository.find({ where: { isActive: true } });

    for (const alert of alerts) {
      this.scheduleCheck(alert);
    }

    // Listen for alert creation
    dataSource.subscribers.push({
      listenTo: () => Alert,
      afterInsert: (event) => {
        const alert = event.entity as Alert;
        if (alert.isActive) {
          this.scheduleCheck(alert);
        }
      },
      afterUpdate: (event) => {
        const alert = event.entity as Alert;

        // If alert was updated, reschedule checks
        if (this.checkIntervals.has(alert.id)) {
          clearTimeout(this.checkIntervals.get(alert.id)!);
          this.checkIntervals.delete(alert.id);
        }

        if (alert.isActive) {
          this.scheduleCheck(alert);
        }
      },
      afterRemove: (event) => {
        const alert = event.entity as Alert;

        // Clear interval if alert was deleted
        if (this.checkIntervals.has(alert.id)) {
          clearTimeout(this.checkIntervals.get(alert.id)!);
          this.checkIntervals.delete(alert.id);
        }
      },
    });
  }

  /**
   * Schedule a price check for an alert
   */
  private scheduleCheck(alert: Alert) {
    // Calculate when to run the check based on frequency
    const delay = calculateNextCheckDelay(alert.checkFrequency);

    this.fastify.log.debug(
      { alertId: alert.id, delay: delay },
      `Scheduling price check in ${delay / (1000 * 60)} minutes (${alert.checkFrequency})`,
    );

    // Schedule the check
    const timeout = setTimeout(async () => {
      await this.checkPrice(alert);

      // If alert is still active, schedule the next check
      const updatedAlert = await alertService.getAlertById(alert.id);
      if (updatedAlert && updatedAlert.isActive) {
        this.scheduleCheck(updatedAlert);
      }
    }, delay);

    // Store the timeout for cleanup
    this.checkIntervals.set(alert.id, timeout);
  }

  /**
   * Check if the price condition is met
   */
  private async checkPrice(alert: Alert) {
    try {
      this.fastify.log.debug({ alertId: alert.id }, "Checking price");

      // Update last checked timestamp
      alert.lastCheckedAt = new Date();
      await AlertRepository.save(alert);

      // Check if price condition is met
      const isPriceConditionMet = await alertService.checkPriceCondition(alert);

      if (isPriceConditionMet) {
        await this.sendNotification(alert);
      }
    } catch (error) {
      this.fastify.log.error(
        { alertId: alert.id, error },
        "Error checking price",
      );
    }
  }

  /**
   * Send notification when price condition is met
   */
  private async sendNotification(alert: Alert) {
    this.fastify.log.info(
      { alertId: alert.id },
      "Price condition met, sending notification",
    );

    // Update last notified timestamp
    alert.lastNotifiedAt = new Date();
    await AlertRepository.save(alert);

    // In a real application, you would implement actual notification logic here
    // This could be sending an email, push notification, etc.

    // For simulation purposes, we'll just log the notification
    this.fastify.log.info({
      type: "PRICE_ALERT",
      alertId: alert.id,
      productUrl: alert.productUrl,
      desiredPrice: alert.desiredPrice,
      message: `The price for the product at ${alert.productUrl} has met or dropped below your desired price of ${alert.desiredPrice}.`,
    });
  }

  /**
   * Cleanup resources when shutting down
   */
  cleanup() {
    // Clear all scheduled checks
    for (const timeout of this.checkIntervals.values()) {
      clearTimeout(timeout);
    }

    this.checkIntervals.clear();
    this.fastify.log.info("Price checking service stopped");
  }
}
