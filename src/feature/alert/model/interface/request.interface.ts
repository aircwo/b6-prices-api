import { CreateAlertDTO } from "../dto/createAlert.dto";
import { CheckFrequency } from "../enum/checkFrequency.enum";

type BaseRequestParams = {
  id: string;
};

export interface CreateAlertRequest {
  Body: CreateAlertDTO;
}

export interface UpdateAlertRequest {
  Params: BaseRequestParams;
  Body: {
    productUrl?: string;
    desiredPrice?: number;
    checkFrequency?: CheckFrequency;
  };
}

export interface AlertParamsRequest {
  Params: BaseRequestParams;
}
