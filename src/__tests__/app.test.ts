import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

jest.mock("fastify");
jest.mock("@fastify/cors");
jest.mock("@fastify/helmet");
jest.mock("../core/config", () => ({
  config: {
    nodeEnv: "test",
  },
  getLogLevel: jest.fn().mockReturnValue("silent"),
}));

describe("app init", () => {
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
      "/health",
      expect.any(Function),
    );
  });

  it("should return correct response from health check endpoint", async () => {
    // given
    buildApp();
    const healthCheckHandlerCall = mockApp.get.mock.calls.find(
      (call: any) => call[0] === "/health",
    );
    const healthCheckHandler = healthCheckHandlerCall[1];

    // When
    const response = await healthCheckHandler();

    // Then
    expect(response).toEqual({
      status: "OK",
      message: "API is up and running",
    });
  });
});
