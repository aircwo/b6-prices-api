import { CheckFrequency } from "../../feature/alert/model/enum/checkFrequency.enum";

/**
 * Calculate the delay until the next price check based on frequency
 */
export function calculateNextCheckDelay(frequency: CheckFrequency): number {

  switch (frequency) {
    case CheckFrequency.TEST:
      return 2 * 60 * 1000; // 2 minutes for testing

    default:
      return 24 * 60 * 60 * 1000; // Default to daily
  }
}
