import { CheckFrequency } from "../enum/checkFrequency.enum";

export interface CreateAlertDTO {
  productUrl: string;
  desiredPrice: number;
  checkFrequency: CheckFrequency;
}
