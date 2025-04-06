import { Alert } from "../model/entity/alert.entity";
import { dataSource } from "../../../core/config/database";
import { AlertRepository } from "../repository/alert.repository";
import { FastifyInstance } from "fastify";

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
    // todo
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
