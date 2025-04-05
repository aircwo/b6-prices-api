import { DataSource } from "typeorm";
import { config } from "./index";
import { Alert } from "../../feature/alert/model/entity/alert.entity";
import { DEFAULT_ENVIRONMENT } from "../utils/constants";

export const dataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  synchronize: config.nodeEnv === DEFAULT_ENVIRONMENT,
  logging: config.nodeEnv === DEFAULT_ENVIRONMENT,
  entities: [Alert],
  migrations: ["../../infrastructure/database/migrations/**/*{.ts}"],
});

export const initializeDataSource = async () => {
  try {
    await dataSource.initialize();
    config.logger.info(
      "Database connection has been established successfully.",
    );
  } catch (error) {
    config.logger.error("Error initializing database connection:", error);
    process.exit(1);
  }
};
