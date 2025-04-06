import { dataSource } from "../../../core/config/database";
import { Alert } from "../model/entity/alert.entity";

export const AlertRepository = dataSource.getRepository(Alert);
