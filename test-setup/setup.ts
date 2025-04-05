import pino from "pino";

process.env.NODE_ENV = "test";

/**
 * Helper function to set up spies on a logger instance
 * @param logger - The logger instance to spy on
 * @returns Object containing spies for common logger methods
 */
export const spyOnLogger = (logger: pino.Logger) => {
  return {
    info: jest.spyOn(logger, "info").mockImplementation(),
    debug: jest.spyOn(logger, "debug").mockImplementation(),
    error: jest.spyOn(logger, "error").mockImplementation(),
    warn: jest.spyOn(logger, "warn").mockImplementation(),
  };
};
