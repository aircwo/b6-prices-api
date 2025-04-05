import { loggerConfig, getLogLevel } from "..";
import { DEFAULT_ENVIRONMENT } from "../../utils/constants";

describe("config", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("loggerConfig", () => {
    test("should have the correct transport configuration", () => {
      // given / when / then
      expect(loggerConfig).toEqual({
        transport: {
          target: "pino-pretty",
          options: {
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        },
      });
    });
  });

  describe("getLogLevel", () => {
    test("should return 'debug' when NODE_ENV is set to DEFAULT_ENVIRONMENT", () => {
      // given
      const nodeEnv = DEFAULT_ENVIRONMENT;

      // when
      const result = getLogLevel(nodeEnv);

      // then
      expect(result).toBe("debug");
    });

    test("should return 'info' when NODE_ENV is not DEFAULT_ENVIRONMENT", () => {
      // given
      const nodeEnv = "production";

      // when
      const result = getLogLevel(nodeEnv);

      // then
      expect(result).toBe("info");
    });

    test("should use LOG_LEVEL from environment if it is set", () => {
      // given
      process.env.LOG_LEVEL = "warn";

      // when
      const result = getLogLevel();

      // then
      expect(result).toBe("warn");
    });

    test("should prioritise LOG_LEVEL over NODE_ENV", () => {
      // given
      process.env.LOG_LEVEL = "error";
      const nodeEnv = DEFAULT_ENVIRONMENT;

      // when
      const result = getLogLevel(nodeEnv);

      // then
      expect(result).toBe("error");
    });
  });

  describe("config", () => {
    test("should use default values when environment variables are not set", async () => {
      // given
      delete process.env.PORT;
      delete process.env.NODE_ENV;
      delete process.env.LOG_LEVEL;

      // Re-import to get a fresh config
      jest.resetModules();
      const { config: freshConfig } = await import("../index");

      // when / then
      expect(freshConfig.port).toBe(3000);
      expect(freshConfig.nodeEnv).toBe(DEFAULT_ENVIRONMENT);
      expect(freshConfig.logger).toBeDefined();
      expect(freshConfig.logger).toEqual(
        expect.objectContaining({
          info: expect.any(Function),
          debug: expect.any(Function),
          error: expect.any(Function),
          warn: expect.any(Function),
          level: expect.stringMatching(/debug|info/),
        }),
      );
    });

    test("should use environment variables when they are set", async () => {
      // given
      process.env.PORT = "4000";
      process.env.NODE_ENV = "production";
      process.env.LOG_LEVEL = "warn";

      // when Re-import to get a fresh config with new env vars
      jest.resetModules();
      const { config: freshConfig } = await import("../index");

      // then
      expect(freshConfig.port).toBe(4000);
      expect(freshConfig.nodeEnv).toBe("production");
      expect(freshConfig.logger).toEqual(
        expect.objectContaining({
          info: expect.any(Function),
          debug: expect.any(Function),
          error: expect.any(Function),
          warn: expect.any(Function),
          level: "warn", // Should use environment variable
        }),
      );
    });

    test("should handle invalid numeric environment variables", async () => {
      // given
      process.env.PORT = "not-a-number";

      // when
      jest.resetModules();
      const { config: freshConfig } = await import("../index");

      // then
      expect(freshConfig.port).toBe(3000);
    });
  });
});
