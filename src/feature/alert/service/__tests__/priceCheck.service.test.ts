import { FastifyInstance } from "fastify";
import { Alert } from "../../model/entity/alert.entity";
import { CheckFrequency } from "../../model/enum/checkFrequency.enum";
import { AlertRepository } from "../../repository/alert.repository";
import { alertService } from "../alert.service";
import { PriceCheckService } from "../priceCheck.service";
import { ALERT_DESIRED_PRICE, ALERT_PRODUCT_URL } from "../../../../../test-setup/testConstants";

jest.mock("../../repository/alert.repository", () => ({
  AlertRepository: {
    find: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock("../../../../core/config/database", () => ({
  dataSource: {
    getRepository: jest.fn(),
    subscribers: [],
  },
}));
jest.mock("../alert.service");

// Helper function to create mock alert
const createMockAlert = (id: string, isActive = true): Alert => {
  const alert = new Alert();
  alert.id = id;
  alert.productUrl = ALERT_PRODUCT_URL;
  alert.desiredPrice = ALERT_DESIRED_PRICE;
  alert.checkFrequency = CheckFrequency.HOURLY;
  alert.isActive = isActive;
  return alert;
};

describe("PriceCheckService", () => {
  let service: PriceCheckService;
  let mockFastify: FastifyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock fastify instance
    mockFastify = {
      log: {
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
      },
    } as unknown as FastifyInstance;

    // Mock setTimeout and clearTimeout
    jest.useFakeTimers();
    jest.spyOn(global, "setTimeout");
    jest.spyOn(global, "clearTimeout");

    // Create service instance
    service = new PriceCheckService(mockFastify);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("initialise", () => {
    it("should schedule checks for all active alerts", async () => {
      // given
      const mockAlerts = [
        createMockAlert("1"),
        createMockAlert("2"),
        createMockAlert("3", false), // Inactive alert
      ];

      (AlertRepository.find as jest.Mock).mockResolvedValue(mockAlerts);

      // when
      await service.initialize();

      // then
      expect(mockFastify.log.info).toHaveBeenCalledWith(
        "Initialising price checking service",
      );
      expect(AlertRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it("should register event handlers for alert lifecycle", () => {
      // todo
    });
  });

  describe("cleanup", () => {
    it("should clear all scheduled checks", () => {
      // given
      (service as any).checkIntervals.set("1", 100);
      (service as any).checkIntervals.set("2", 200);

      // when
      service.cleanup();

      // then
      expect(clearTimeout).toHaveBeenCalledTimes(2);
      expect(clearTimeout).toHaveBeenCalledWith(100);
      expect(clearTimeout).toHaveBeenCalledWith(200);
      expect((service as any).checkIntervals.size).toBe(0);
      expect(mockFastify.log.info).toHaveBeenCalledWith(
        "Price checking service stopped",
      );
    });
  });

  describe("scheduleCheck", () => {
    it("should schedule a price check with the correct delay", async () => {
      // given
      const alert = createMockAlert("schedule-test");

      // Mock the calculateNextCheckDelay function (we'll test it separately)
      const originalCalcFn = (
        await import("../../../../core/utils/calculateNextCheckDelay")
      ).calculateNextCheckDelay;
      (
        await import("../../../../core/utils/calculateNextCheckDelay")
      ).calculateNextCheckDelay = jest.fn().mockReturnValue(60000); // 1 minute

      // when
      (service as any).scheduleCheck(alert);

      // then
      expect(setTimeout).toHaveBeenCalled();
      expect(mockFastify.log.debug).toHaveBeenCalled();
      expect((service as any).checkIntervals.has(alert.id)).toBe(true);
      // restore
      (
        await import("../../../../core/utils/calculateNextCheckDelay")
      ).calculateNextCheckDelay = originalCalcFn;
    });

    it("should check price and reschedule when timeout expires", async () => {
      // given
      const alert = createMockAlert("timeout-test");
      const updatedAlert = { ...alert };

      (alertService.getAlertById as jest.Mock).mockResolvedValue(updatedAlert);
      (AlertRepository.save as jest.Mock).mockResolvedValue(alert);
      (alertService.checkPriceCondition as jest.Mock).mockResolvedValue(false);

      // Mock the schedule function to avoid infinite recursion
      const originalScheduleFn = (service as any).scheduleCheck;
      (service as any).scheduleCheck = jest.fn();

      // when
      originalScheduleFn.call(service, alert);

      // Fast-forward through the timeout
      jest.runOnlyPendingTimers();
      await Promise.resolve(); // Let the async code execute

      // then
      expect(AlertRepository.save).toHaveBeenCalled();
      expect(alertService.checkPriceCondition).toHaveBeenCalledWith(alert);
      // expect(alertService.getAlertById).toHaveBeenCalledWith(alert.id);
      // expect((service as any).scheduleCheck).toHaveBeenCalledWith(updatedAlert);
    });
  });

  describe("checkPrice", () => {
    it("should update lastCheckedAt and check price condition", async () => {
      // given
      const alert = createMockAlert("check-price-test");
      (AlertRepository.save as jest.Mock).mockResolvedValue(alert);
      (alertService.checkPriceCondition as jest.Mock).mockResolvedValue(false);

      // when
      await (service as any).checkPrice(alert);

      // then
      expect(alert.lastCheckedAt).toBeDefined();
      expect(AlertRepository.save).toHaveBeenCalledWith(alert);
      expect(alertService.checkPriceCondition).toHaveBeenCalledWith(alert);
    });

    it("should send notification when price condition is met", async () => {
      // given
      const alert = createMockAlert("notification-test");
      (AlertRepository.save as jest.Mock).mockResolvedValue(alert);
      (alertService.checkPriceCondition as jest.Mock).mockResolvedValue(true);

      // Mock sendNotification
      (service as any).sendNotification = jest.fn();

      // when
      await (service as any).checkPrice(alert);

      // then
      expect((service as any).sendNotification).toHaveBeenCalledWith(alert);
    });

    it("should handle errors during price checking", async () => {
      // given
      const alert = createMockAlert("error-test");
      const testError = new Error("Test error");
      (AlertRepository.save as jest.Mock).mockRejectedValue(testError);

      // when
      await (service as any).checkPrice(alert);

      // then
      expect(mockFastify.log.error).toHaveBeenCalledWith(
        { alertId: alert.id, error: testError },
        "Error checking price",
      );
    });
  });

  describe("sendNotification", () => {
    it("should update lastNotifiedAt and log notification", async () => {
      // given
      const alert = createMockAlert("send-notification-test");
      (AlertRepository.save as jest.Mock).mockResolvedValue(alert);

      // when
      await (service as any).sendNotification(alert);

      // then
      expect(alert.lastNotifiedAt).toBeDefined();
      expect(AlertRepository.save).toHaveBeenCalledWith(alert);
      expect(mockFastify.log.info).toHaveBeenCalledWith(
        { alertId: alert.id },
        "Price condition met, sending notification",
      );
      expect(mockFastify.log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "PRICE_ALERT",
          alertId: alert.id,
          productUrl: alert.productUrl,
          desiredPrice: alert.desiredPrice,
        }),
      );
    });
  });
});
