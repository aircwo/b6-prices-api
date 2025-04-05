import { dataSource, initializeDataSource } from "../database"; // Adjust the path as needed
import { spyOnLogger } from "../../../../test-setup/setup";
import { config } from "..";

jest.mock("typeorm", () => {
  const initializeMock = jest.fn().mockResolvedValue(undefined);
  const mockedDataSource = {
    initialize: initializeMock,
  };
  return {
    DataSource: jest.fn(() => mockedDataSource),
  };
});

jest.mock("../../../feature/alert/model/entity/alert.entity", () => ({
  Alert: class MockAlert {},
}));

describe("database", () => {
  const loggerSpies = spyOnLogger(config.logger);
  const originalExit = process.exit;

  beforeEach(() => {
    process.exit = jest.fn() as never;
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.exit = originalExit;
  });

  describe("initializeDataSource", () => {
    test("should log success message when initialisation succeeds", async () => {
      // given / when
      await initializeDataSource();

      // then
      expect(dataSource.initialize).toHaveBeenCalled();
      expect(loggerSpies.info).toHaveBeenCalledWith(
        "Database connection has been established successfully.",
      );
      expect(loggerSpies.error).not.toHaveBeenCalled();
      expect(process.exit).not.toHaveBeenCalled();
    });

    test("should log error and exit process when initialisation fails", async () => {
      // given
      const testError = new Error("Test database error");
      // Override the default successful mock to reject instead
      (dataSource.initialize as jest.Mock).mockRejectedValueOnce(testError);

      // when
      await initializeDataSource();

      // then
      expect(dataSource.initialize).toHaveBeenCalled();
      expect(loggerSpies.error).toHaveBeenCalledWith(
        "Error initializing database connection:",
        testError,
      );
      expect(loggerSpies.info).not.toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});
