import { FastifyInstance } from "fastify";
import {
  createAlertSchema,
  alertParamsSchema,
  updateAlertSchema,
} from "../../../core/utils/schemas";
import { alertController } from "../controller/alert.controller";
import alertRoutes from "./alert.routes";

describe("alertRoutes", () => {
  let mockFastify: jest.Mocked<FastifyInstance>;

  beforeEach(() => {
    // given
    mockFastify = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      addHook: jest.fn(),
    } as unknown as jest.Mocked<FastifyInstance>;
  });

  it("should register POST / with createAlert schema and handler", async () => {
    // when
    await alertRoutes(mockFastify, {});

    // then
    expect(mockFastify.post).toHaveBeenCalledWith(
      "/",
      { schema: createAlertSchema },
      alertController.createAlert,
    );
  });

  it("should register GET / with getAllAlerts handler", async () => {
    // when
    await alertRoutes(mockFastify, {});

    // then
    expect(mockFastify.get).toHaveBeenCalledWith(
      "/",
      alertController.getAllAlerts,
    );
  });

  it("should register GET /:id with alertParamsSchema and getAlertById handler", async () => {
    // when
    await alertRoutes(mockFastify, {});

    // then
    expect(mockFastify.get).toHaveBeenCalledWith(
      "/:id",
      { schema: { params: alertParamsSchema } },
      alertController.getAlertById,
    );
  });

  it("should register PUT /:id with updateAlertSchema + alertParamsSchema and updateAlert handler", async () => {
    // when
    await alertRoutes(mockFastify, {});

    // then
    expect(mockFastify.put).toHaveBeenCalledWith(
      "/:id",
      { schema: { ...updateAlertSchema, params: alertParamsSchema } },
      alertController.updateAlert,
    );
  });

  it("should register DELETE /:id with alertParamsSchema and deleteAlert handler", async () => {
    // when
    await alertRoutes(mockFastify, {});

    // then
    expect(mockFastify.delete).toHaveBeenCalledWith(
      "/:id",
      { schema: { params: alertParamsSchema } },
      alertController.deleteAlert,
    );
  });
});
