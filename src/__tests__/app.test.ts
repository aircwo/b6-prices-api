import Fastify from "fastify";
import alertRoutes from "../feature/alert/routes/alert.routes";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

jest.mock("fastify");
jest.mock("@fastify/cors");
jest.mock("@fastify/helmet");
jest.mock("../feature/alert/routes/alert.routes");
jest.mock("../feature/alert/service/priceCheck.service");
jest.mock("../core/config", () => ({
  config: {
    nodeEnv: "test",
    database: {
      host: "localhost",
      port: 5432,
      username: "test",
      password: "test",
      database: "test_db",
    },
  },
  getLogLevel: jest.fn().mockReturnValue("silent"),
}));

describe("App Initialization", () => {
  let mockApp: any;
  let buildApp: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up the mock Fastify instance
    mockApp = {
      register: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      setNotFoundHandler: jest.fn().mockReturnThis(),
      setErrorHandler: jest.fn().mockReturnThis(),
      addHook: jest.fn().mockReturnThis(),
      decorate: jest.fn().mockReturnThis(),
    };

    (Fastify as unknown as jest.Mock).mockReturnValue(mockApp);

    // Dynamically import the app to ensure our mocks are set up first
    jest.isolateModules(async () => {
      buildApp = (await import("../app")).default;
    });
  });

  it("should create a Fastify instance with logger configuration", () => {
    // given / when
    buildApp();

    // then
    expect(Fastify).toHaveBeenCalledWith(
      expect.objectContaining({
        logger: expect.objectContaining({
          level: "silent",
        }),
      }),
    );
  });

  it("should register security plugins", () => {
    // given / when
    buildApp();

    // then
    expect(mockApp.register).toHaveBeenCalledWith(cors);
    expect(mockApp.register).toHaveBeenCalledWith(helmet);
  });

  it("should define a health check endpoint", () => {
    // given / when
    buildApp();

    // then
    expect(mockApp.get).toHaveBeenCalledWith(
      "/prices-api/v1/health",
      expect.any(Function),
    );
  });

  it("should register alert routes with correct prefix", () => {
    // given / when
    buildApp();

    // then
    expect(mockApp.register).toHaveBeenCalledWith(alertRoutes, {
      prefix: "/prices-api/v1/alerts",
    });
  });

  it("should set up error handlers", () => {
    // given / when
    buildApp();

    // then
    expect(mockApp.setNotFoundHandler).toHaveBeenCalledWith(
      expect.any(Function),
    );
    expect(mockApp.setErrorHandler).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should set up onReady hook to initialize price check service", () => {
    // When
    buildApp();

    // Then
    expect(mockApp.addHook).toHaveBeenCalledWith(
      "onReady",
      expect.any(Function),
    );
  });

  it("should set up onClose hook for cleanup", () => {
    // When
    buildApp();

    // Then
    expect(mockApp.addHook).toHaveBeenCalledWith(
      "onClose",
      expect.any(Function),
    );
  });

  // Test the health check endpoint handler
  it("should return correct response from health check endpoint", async () => {
    // given
    buildApp();

    // Get the health check handler function
    const healthCheckHandlerCall = mockApp.get.mock.calls.find(
      (call: any) => call[0] === "/prices-api/v1/health",
    );
    const healthCheckHandler = healthCheckHandlerCall[1];

    // when
    const response = await healthCheckHandler();

    // then
    expect(response).toEqual({
      status: "OK",
      message: "API is up and running",
    });
  });

  it("should handle 404 errors correctly", () => {
    // given
    buildApp();

    const notFoundHandler = mockApp.setNotFoundHandler.mock.calls[0][0];
    const request = {};
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // when
    notFoundHandler(request, reply);

    // then
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Resource not found" });
  });
});
