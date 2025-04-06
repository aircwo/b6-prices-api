import { FastifyInstance } from "fastify";
import { Alert } from "../../model/entity/alert.entity";
import { CheckFrequency } from "../../model/enum/checkFrequency.enum";
import { AlertRepository } from "../../repository/alert.repository";
import { alertService } from "../alert.service";
import { PriceCheckService } from "../priceCheck.service";

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
  alert.productUrl = "https://example.com/product";
  alert.desiredPrice = 99.99;
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
});
