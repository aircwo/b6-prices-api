import { config } from "./config";
import { initializeDataSource } from "./config/database";
import buildApp from "../app";

const PORT = config.port;

const initServer = async () => {
  try {
    await initializeDataSource();

    const app = buildApp();

    await app.listen({
      port: PORT,
      host: "0.0.0.0",
    });

    app.log.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  } catch (error) {
    config.logger.error("Error initialising server:", error);
    process.exit(1);
  }
};

export default initServer;
