import { FastifyReply, FastifyRequest } from "fastify";
import { alertController } from "../controller/alert.controller";
import { alertService } from "../service/alert.service";
import {
  AlertParamsRequest,
  CreateAlertRequest,
  UpdateAlertRequest,
} from "../model/interface/request.interface";
import { CheckFrequency } from "../model/enum/checkFrequency.enum";
import {
  ALERT_DESIRED_PRICE,
  ALERT_DESIRED_PRICE_UPDATED,
  ALERT_ID,
  ALERT_PRODUCT_URL,
  NOT_FOUND_ALERT_ID,
} from "../../../../test-setup/testConstants";

jest.mock("../service/alert.service", () => ({
  alertService: {
    createAlert: jest.fn(),
    getAllAlerts: jest.fn(),
    getAlertById: jest.fn(),
    updateAlert: jest.fn(),
    deleteAlert: jest.fn(),
  },
}));

describe("alert.controller", () => {
  // more time would move common constants to a separate file and use across all tests
  const TEST_USER_ID = "user123";
  const TEST_ERROR_MESSAGE = "Test error";

  const genericTestError = new Error(TEST_ERROR_MESSAGE);

  // Response message constants
  const MESSAGES = {
    CREATE_SUCCESS: "Price alert has been set successfully.",
    UPDATE_SUCCESS: "Alert updated successfully.",
    DELETE_SUCCESS: "Alert deleted successfully.",
    NOT_FOUND: "Alert not found.",
    DELETE_NOT_FOUND: "Alert not found or already deleted.",
    ERROR_CREATE: "An error occurred while creating the alert.",
    ERROR_FETCH: "An error occurred while fetching alerts.",
    ERROR_FETCH_ONE: "An error occurred while fetching the alert.",
    ERROR_UPDATE: "An error occurred while updating the alert.",
    ERROR_DELETE: "An error occurred while deleting the alert.",
  };

  const STATUS = {
    OK: 200,
    CREATED: 201,
    NOT_FOUND: 404,
    ERROR: 500,
  };

  const mockAlert = {
    id: ALERT_ID,
    productUrl: ALERT_PRODUCT_URL,
    desiredPrice: ALERT_DESIRED_PRICE,
    checkFrequency: CheckFrequency.DAILY,
    userId: TEST_USER_ID,
    createdAt: new Date().toISOString(),
  };

  const createAlertDTO = {
    productUrl: ALERT_PRODUCT_URL,
    desiredPrice: ALERT_DESIRED_PRICE,
    checkFrequency: CheckFrequency.DAILY,
    userId: TEST_USER_ID,
  };

  const updateAlertDTO = {
    desiredPrice: ALERT_DESIRED_PRICE_UPDATED,
    checkFrequency: CheckFrequency.HOURLY,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Type-specific mock request creators
  const mockCreateAlertRequest = (body = {}) => {
    return {
      body,
      log: {
        error: jest.fn(),
      },
    } as unknown as FastifyRequest<CreateAlertRequest>;
  };

  const mockAlertParamsRequest = (params = {}) => {
    return {
      params,
      log: {
        error: jest.fn(),
      },
    } as unknown as FastifyRequest<AlertParamsRequest>;
  };

  const mockUpdateAlertRequest = (params = {}, body = {}) => {
    return {
      params,
      body,
      log: {
        error: jest.fn(),
      },
    } as unknown as FastifyRequest<UpdateAlertRequest>;
  };

  const mockGenericRequest = () => {
    return {
      log: {
        error: jest.fn(),
      },
    } as unknown as FastifyRequest;
  };

  const mockReply = () => {
    const reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    return reply as unknown as FastifyReply;
  };

  describe("createAlert", () => {
    it("should create an alert and return 201 status code", async () => {
      // given
      const req = mockCreateAlertRequest(createAlertDTO);
      const reply = mockReply();

      (alertService.createAlert as jest.Mock).mockResolvedValue(mockAlert);

      // when
      await alertController.createAlert(req, reply);

      // then
      expect(alertService.createAlert).toHaveBeenCalledWith(createAlertDTO);
      expect(reply.code).toHaveBeenCalledWith(STATUS.CREATED);
      expect(reply.send).toHaveBeenCalledWith({
        success: true,
        message: MESSAGES.CREATE_SUCCESS,
        data: mockAlert,
      });
    });

    it("should handle errors and return 500 status code", async () => {
      // given
      const req = mockCreateAlertRequest(createAlertDTO);
      const reply = mockReply();

      (alertService.createAlert as jest.Mock).mockRejectedValue(
        genericTestError,
      );

      // when
      await alertController.createAlert(req, reply);

      // then
      expect(req.log.error).toHaveBeenCalledWith(
        genericTestError,
        "Error creating alert",
      );
      expect(reply.code).toHaveBeenCalledWith(STATUS.ERROR);
      expect(reply.send).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.ERROR_CREATE,
      });
    });
  });

  describe("getAllAlerts", () => {
    const mockAlerts = [mockAlert, { ...mockAlert, id: "456" }];

    it("should return all alerts with 200 status code", async () => {
      // given
      const req = mockGenericRequest();
      const reply = mockReply();

      (alertService.getAllAlerts as jest.Mock).mockResolvedValue(mockAlerts);

      // when
      await alertController.getAllAlerts(req, reply);

      // then
      expect(alertService.getAllAlerts).toHaveBeenCalled();
      expect(reply.code).toHaveBeenCalledWith(STATUS.OK);
      expect(reply.send).toHaveBeenCalledWith({
        success: true,
        count: mockAlerts.length,
        data: mockAlerts,
      });
    });

    it("should handle errors and return 500 status code", async () => {
      // given
      const req = mockGenericRequest();
      const reply = mockReply();

      (alertService.getAllAlerts as jest.Mock).mockRejectedValue(
        genericTestError,
      );

      // when
      await alertController.getAllAlerts(req, reply);

      // then
      expect(req.log.error).toHaveBeenCalledWith(
        genericTestError,
        "Error fetching alerts",
      );
      expect(reply.code).toHaveBeenCalledWith(STATUS.ERROR);
      expect(reply.send).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.ERROR_FETCH,
      });
    });
  });

  describe("getAlertById", () => {
    it("should return an alert with 200 status code when found", async () => {
      // given
      const req = mockAlertParamsRequest({ id: ALERT_ID });
      const reply = mockReply();

      (alertService.getAlertById as jest.Mock).mockResolvedValue(mockAlert);

      // when
      await alertController.getAlertById(req, reply);

      // then
      expect(alertService.getAlertById).toHaveBeenCalledWith(ALERT_ID);
      expect(reply.code).toHaveBeenCalledWith(STATUS.OK);
      expect(reply.send).toHaveBeenCalledWith({
        success: true,
        data: mockAlert,
      });
    });

    it("should return 404 status code when alert is not found", async () => {
      // given
      const req = mockAlertParamsRequest({ id: NOT_FOUND_ALERT_ID });
      const reply = mockReply();

      (alertService.getAlertById as jest.Mock).mockResolvedValue(null);

      // when
      await alertController.getAlertById(req, reply);

      // then
      expect(alertService.getAlertById).toHaveBeenCalledWith(
        NOT_FOUND_ALERT_ID,
      );
      expect(reply.code).toHaveBeenCalledWith(STATUS.NOT_FOUND);
      expect(reply.send).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.NOT_FOUND,
      });
    });

    it("should handle errors and return 500 status code", async () => {
      // given
      const req = mockAlertParamsRequest({ id: ALERT_ID });
      const reply = mockReply();

      (alertService.getAlertById as jest.Mock).mockRejectedValue(
        genericTestError,
      );

      // when
      await alertController.getAlertById(req, reply);

      // then
      expect(req.log.error).toHaveBeenCalledWith(
        genericTestError,
        "Error fetching alert",
      );
      expect(reply.code).toHaveBeenCalledWith(STATUS.ERROR);
      expect(reply.send).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.ERROR_FETCH_ONE,
      });
    });
  });

  describe("updateAlert", () => {
    it("should update an alert and return 200 status code when found", async () => {
      // given
      const req = mockUpdateAlertRequest({ id: ALERT_ID }, updateAlertDTO);
      const reply = mockReply();
      const updatedAlert = { ...mockAlert, ...updateAlertDTO };

      (alertService.updateAlert as jest.Mock).mockResolvedValue(updatedAlert);

      // when
      await alertController.updateAlert(req, reply);

      // then
      expect(alertService.updateAlert).toHaveBeenCalledWith(
        ALERT_ID,
        updateAlertDTO,
      );
      expect(reply.code).toHaveBeenCalledWith(STATUS.OK);
      expect(reply.send).toHaveBeenCalledWith({
        success: true,
        message: MESSAGES.UPDATE_SUCCESS,
        data: updatedAlert,
      });
    });

    it("should return 404 status code when alert is not found", async () => {
      // given
      const req = mockUpdateAlertRequest(
        { id: NOT_FOUND_ALERT_ID },
        updateAlertDTO,
      );
      const reply = mockReply();

      (alertService.updateAlert as jest.Mock).mockResolvedValue(null);

      // when
      await alertController.updateAlert(req, reply);

      // then
      expect(alertService.updateAlert).toHaveBeenCalledWith(
        NOT_FOUND_ALERT_ID,
        updateAlertDTO,
      );
      expect(reply.code).toHaveBeenCalledWith(STATUS.NOT_FOUND);
      expect(reply.send).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.NOT_FOUND,
      });
    });

    it("should handle errors and return 500 status code", async () => {
      // given
      const req = mockUpdateAlertRequest({ id: ALERT_ID }, updateAlertDTO);
      const reply = mockReply();

      (alertService.updateAlert as jest.Mock).mockRejectedValue(
        genericTestError,
      );

      // when
      await alertController.updateAlert(req, reply);

      // then
      expect(req.log.error).toHaveBeenCalledWith(
        genericTestError,
        "Error updating alert",
      );
      expect(reply.code).toHaveBeenCalledWith(STATUS.ERROR);
      expect(reply.send).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.ERROR_UPDATE,
      });
    });
  });

  describe("deleteAlert", () => {
    it("should delete an alert and return 200 status code when found", async () => {
      // given
      const req = mockAlertParamsRequest({ id: ALERT_ID });
      const reply = mockReply();

      (alertService.deleteAlert as jest.Mock).mockResolvedValue(true);

      // when
      await alertController.deleteAlert(req, reply);

      // then
      expect(alertService.deleteAlert).toHaveBeenCalledWith(ALERT_ID);
      expect(reply.code).toHaveBeenCalledWith(STATUS.OK);
      expect(reply.send).toHaveBeenCalledWith({
        success: true,
        message: MESSAGES.DELETE_SUCCESS,
      });
    });

    it("should return 404 status code when alert is not found", async () => {
      // given
      const req = mockAlertParamsRequest({ id: NOT_FOUND_ALERT_ID });
      const reply = mockReply();

      (alertService.deleteAlert as jest.Mock).mockResolvedValue(false);

      // when
      await alertController.deleteAlert(req, reply);

      // then
      expect(alertService.deleteAlert).toHaveBeenCalledWith(NOT_FOUND_ALERT_ID);
      expect(reply.code).toHaveBeenCalledWith(STATUS.NOT_FOUND);
      expect(reply.send).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.DELETE_NOT_FOUND,
      });
    });

    it("should handle errors and return 500 status code", async () => {
      // given
      const req = mockAlertParamsRequest({ id: ALERT_ID });
      const reply = mockReply();

      (alertService.deleteAlert as jest.Mock).mockRejectedValue(
        genericTestError,
      );

      // when
      await alertController.deleteAlert(req, reply);

      // then
      expect(req.log.error).toHaveBeenCalledWith(
        genericTestError,
        "Error deleting alert",
      );
      expect(reply.code).toHaveBeenCalledWith(STATUS.ERROR);
      expect(reply.send).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.ERROR_DELETE,
      });
    });
  });
});
