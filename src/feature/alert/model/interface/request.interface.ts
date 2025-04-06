import { CreateAlertDTO } from "../dto/createAlert.dto";
import { CheckFrequency } from "../enum/checkFrequency.enum";

type BaseRequestParams = {
  id: string;
};

type BaseRequestBody = {
  productUrl?: string;
  desiredPrice?: number;
  checkFrequency?: CheckFrequency;
};

export interface CreateAlertRequest {
  Body: CreateAlertDTO;
}

export interface UpdateAlertRequest {
  Params: BaseRequestParams;
  Body: BaseRequestBody;
}

export interface AlertParamsRequest {
  Params: BaseRequestParams;
}
