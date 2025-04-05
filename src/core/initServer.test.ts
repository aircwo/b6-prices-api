import initServer from "./initServer";
import { config } from "./config";
import { initializeDataSource } from "./config/database";
import * as appModule from "../app";

let mockListen: jest.Mock;
let mockLogInfo: jest.Mock;
let mockDefaultExportFn: jest.Mock;

jest.mock("./config", () => ({
  config: {
    port: 3000,
    nodeEnv: "test",
    logger: {
      error: jest.fn(),
    },
  },
}));

jest.mock("../app");

describe("initServer", () => {
  const originalExit = process.exit;
  const spyOnConfigErrorLog = jest
    .spyOn(config.logger, "error")
    .mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    mockListen = jest.fn().mockResolvedValue(undefined);
    mockLogInfo = jest.fn();
    mockDefaultExportFn = jest.fn().mockReturnValue({
      listen: mockListen,
      log: {
        info: mockLogInfo,
      },
    });

    jest.requireMock("../app").default = mockDefaultExportFn;
    process.exit = jest.fn() as never;
  });

  afterAll(() => {
    process.exit = originalExit;
  });

  it("should initialise the server successfully", async () => {
    // given / when
    await initServer();

    // then
    expect(initializeDataSource).toHaveBeenCalled();
    expect(mockDefaultExportFn).toHaveBeenCalled();
    expect(mockListen).toHaveBeenCalledWith({
      port: config.port,
      host: "0.0.0.0",
    });
    expect(mockLogInfo).toHaveBeenCalledWith(
      `Server running on port ${config.port} in ${config.nodeEnv} mode`,
    );
    expect(spyOnConfigErrorLog).not.toHaveBeenCalled();
    expect(process.exit).not.toHaveBeenCalled();
  });

  it("should handle server listening error", async () => {
    // given
    const listenError = new Error("Port already in use");
    mockListen.mockRejectedValueOnce(listenError);

    // when
    await initServer();

    // then
    expect(mockDefaultExportFn).toHaveBeenCalledTimes(1);
    expect(mockListen).toHaveBeenCalledWith({
      port: config.port,
      host: "0.0.0.0",
    });
    expect(config.logger.error).toHaveBeenCalledWith(
      "Error initialising server:",
      listenError,
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
