import {
  ALERT_DESIRED_PRICE,
  ALERT_DESIRED_PRICE_UPDATED,
  ALERT_ID,
  ALERT_PRODUCT_URL,
} from "../../../../../test-setup/testConstants";
import { CreateAlertDTO } from "../../model/dto/createAlert.dto";
import { Alert } from "../../model/entity/alert.entity";
import { CheckFrequency } from "../../model/enum/checkFrequency.enum";
import { AlertRepository } from "../../repository/alert.repository";
import { alertService } from "../alert.service";
import * as fs from "fs/promises";
import * as path from "path";

jest.mock("../../repository/alert.repository");

describe("AlertService", () => {
  // move to test constants
  const TEST_FREQUENCY = CheckFrequency.DAILY;
  const TEST_UPDATED_FREQUENCY = CheckFrequency.HOURLY;

  const createAlertDTO: CreateAlertDTO = {
    productUrl: ALERT_PRODUCT_URL,
    desiredPrice: ALERT_DESIRED_PRICE,
    checkFrequency: TEST_FREQUENCY,
  };

  const updateAlertDTO: Partial<CreateAlertDTO> = {
    desiredPrice: ALERT_DESIRED_PRICE_UPDATED,
    checkFrequency: TEST_UPDATED_FREQUENCY,
  };

  const mockAlert = new Alert();
  mockAlert.id = ALERT_ID;
  mockAlert.productUrl = ALERT_PRODUCT_URL;
  mockAlert.desiredPrice = ALERT_DESIRED_PRICE;
  mockAlert.checkFrequency = TEST_FREQUENCY;

  describe("createAlert", () => {
    it("should create and return a new alert", async () => {
      // given
      const alertData = { ...createAlertDTO };
      const expectedAlert = { ...mockAlert };
      (AlertRepository.save as jest.Mock).mockResolvedValue(expectedAlert);

      // when
      const result = await alertService.createAlert(alertData);

      // then
      expect(AlertRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedAlert);
      const savedAlert = (AlertRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedAlert.productUrl).toBe(alertData.productUrl);
      expect(savedAlert.desiredPrice).toBe(alertData.desiredPrice);
      expect(savedAlert.checkFrequency).toBe(alertData.checkFrequency);
    });
  });

  describe("getAllAlerts", () => {
    it("should return all alerts", async () => {
      // given
      const expectedAlerts = [mockAlert, { ...mockAlert, id: "456" }];
      (AlertRepository.find as jest.Mock).mockResolvedValue(expectedAlerts);

      // when
      const result = await alertService.getAllAlerts();

      // then
      expect(AlertRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedAlerts);
      expect(result.length).toBe(2);
    });

    it("should return an empty array when no alerts exist", async () => {
      // given
      (AlertRepository.find as jest.Mock).mockResolvedValue([]);

      // when
      const result = await alertService.getAllAlerts();

      // then
      expect(AlertRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe("getAlertById", () => {
    it("should return an alert when found by ID", async () => {
      // given
      (AlertRepository.findOneBy as jest.Mock).mockResolvedValue(mockAlert);

      // when
      const result = await alertService.getAlertById(ALERT_ID);

      // then
      expect(AlertRepository.findOneBy).toHaveBeenCalledWith({ id: ALERT_ID });
      expect(result).toEqual(mockAlert);
    });

    it("should return null when alert is not found by ID", async () => {
      // given
      (AlertRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      // when
      const result = await alertService.getAlertById("non-existent-id");

      // then
      expect(AlertRepository.findOneBy).toHaveBeenCalledWith({
        id: "non-existent-id",
      });
      expect(result).toBeNull();
    });
  });

  describe("updateAlert", () => {
    it("should update an existing alert with all fields", async () => {
      // given
      const foundAlert = { ...mockAlert };
      const updatedAlert = {
        ...mockAlert,
        productUrl: "https://example.com/updated-product",
        desiredPrice: 75.99,
        checkFrequency: CheckFrequency.HOURLY,
      };

      (AlertRepository.findOneBy as jest.Mock).mockResolvedValue(foundAlert);
      (AlertRepository.save as jest.Mock).mockResolvedValue(updatedAlert);

      const updateData = {
        productUrl: "https://example.com/updated-product",
        desiredPrice: 75.99,
        checkFrequency: CheckFrequency.HOURLY,
      };

      // when
      const result = await alertService.updateAlert(ALERT_ID, updateData);

      // then
      expect(AlertRepository.findOneBy).toHaveBeenCalledWith({ id: ALERT_ID });
      expect(AlertRepository.save).toHaveBeenCalledTimes(1);

      // Verify the saved alert has updated properties
      const savedAlert = (AlertRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedAlert.productUrl).toBe(updateData.productUrl);
      expect(savedAlert.desiredPrice).toBe(updateData.desiredPrice);
      expect(savedAlert.checkFrequency).toBe(updateData.checkFrequency);

      expect(result).toEqual(updatedAlert);
    });

    it("should update only specified fields of an alert", async () => {
      // given
      const foundAlert = { ...mockAlert };
      const updatedAlert = {
        ...mockAlert,
        desiredPrice: ALERT_DESIRED_PRICE_UPDATED,
        checkFrequency: TEST_UPDATED_FREQUENCY,
      };

      (AlertRepository.findOneBy as jest.Mock).mockResolvedValue(foundAlert);
      (AlertRepository.save as jest.Mock).mockResolvedValue(updatedAlert);

      // when
      const result = await alertService.updateAlert(ALERT_ID, updateAlertDTO);

      // then
      expect(AlertRepository.findOneBy).toHaveBeenCalledWith({ id: ALERT_ID });
      expect(AlertRepository.save).toHaveBeenCalledTimes(1);

      // Verify only specified fields were updated
      const savedAlert = (AlertRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedAlert.productUrl).toBe(ALERT_PRODUCT_URL); // Unchanged
      expect(savedAlert.desiredPrice).toBe(ALERT_DESIRED_PRICE_UPDATED); // Changed
      expect(savedAlert.checkFrequency).toBe(TEST_UPDATED_FREQUENCY); // Changed

      expect(result).toEqual(updatedAlert);
    });

    it("should return null when alert to update is not found", async () => {
      // given
      (AlertRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      // when
      const result = await alertService.updateAlert(
        "non-existent-id",
        updateAlertDTO,
      );

      // then
      expect(AlertRepository.findOneBy).toHaveBeenCalledWith({
        id: "non-existent-id",
      });
      expect(AlertRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("deleteAlert", () => {
    it("should delete an alert and return true when successful", async () => {
      // given
      (AlertRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      // when
      const result = await alertService.deleteAlert(ALERT_ID);

      // then
      expect(AlertRepository.delete).toHaveBeenCalledWith(ALERT_ID);
      expect(result).toBe(true);
    });

    it("should return false when no alert was deleted", async () => {
      // given
      (AlertRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      // when
      const result = await alertService.deleteAlert("non-existent-id");

      // then
      expect(AlertRepository.delete).toHaveBeenCalledWith("non-existent-id");
      expect(result).toBe(false);
    });
  });

  describe("fetchProductData", () => {
    it("should read and parse product data from the JSON file", async () => {
      // given / when
      const result = await alertService.fetchProductData();

      // then
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toEqual(3);
      result.forEach((product) => {
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("url");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("priceHistory");
        expect(product).toHaveProperty("currentPrice");
        expect(Array.isArray(product.priceHistory)).toBe(true);
        product.priceHistory.forEach((historyItem) => {
          expect(historyItem).toHaveProperty("date");
          expect(historyItem).toHaveProperty("price");
        });
      });
    });

    it("should throw an error when file reading fails", async () => {
      // given
      const originalFetchProductData = alertService.fetchProductData;
      const fileError = new Error("File not found");

      // when
      alertService.fetchProductData = jest.fn().mockRejectedValue(fileError);

      // then
      await expect(
        alertService.checkPriceCondition(new Alert()),
      ).rejects.toThrow(fileError);
      alertService.fetchProductData = originalFetchProductData;
    });
  });

  describe("checkPriceCondition", () => {
    // Fixture helper
    const createTestAlert = (
      price: number,
      url = "https://example.com/products/smartphone-x",
    ) => {
      const alert = new Alert();
      alert.id = ALERT_ID;
      alert.productUrl = url;
      alert.desiredPrice = price;
      alert.checkFrequency = CheckFrequency.DAILY;
      return alert;
    };

    // Set up real product data
    beforeEach(async () => {
      const filePath = path.join(process.cwd(), "data/products.json");
      const data = await fs.readFile(filePath, "utf8");
      jest
        .spyOn(alertService, "fetchProductData")
        .mockResolvedValue(JSON.parse(data));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    // Test cases for price conditions
    const testCases = [
      {
        name: "should return true when product price is below desired price",
        desiredPrice: 899.99,
        productUrl: "https://example.com/products/smartphone-x",
        expectedResult: true,
      },
      {
        name: "should return true when product price equals desired price",
        desiredPrice: 799.99,
        productUrl: "https://example.com/products/smartphone-x",
        expectedResult: true,
      },
      {
        name: "should return false when product price is above desired price",
        desiredPrice: 79.99,
        productUrl: "https://example.com/products/smartphone-x",
        expectedResult: false,
      },
      {
        name: "should return false when product is not found",
        desiredPrice: 999.99,
        productUrl: "https://example.com/non-existent-product",
        expectedResult: false,
      },
    ];

    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        // given
        const alert = createTestAlert(
          testCase.desiredPrice,
          testCase.productUrl,
        );

        // when
        const result = await alertService.checkPriceCondition(alert);

        // then
        expect(alertService.fetchProductData).toHaveBeenCalled();
        expect(result).toBe(testCase.expectedResult);
      });
    });
  });
});
