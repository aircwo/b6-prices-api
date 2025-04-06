import { CheckFrequency } from "../../feature/alert/model/enum/checkFrequency.enum";

/**
 * Calculate the delay until the next price check based on frequency
 */
export function calculateNextCheckDelay(frequency: CheckFrequency): number {
  const now = new Date();

  switch (frequency) {
    case CheckFrequency.TEST:
      return 2 * 60 * 1000; // 2 minutes for testing
    case CheckFrequency.HOURLY:
      return 60 * 60 * 1000; // 1 hour

    case CheckFrequency.DAILY:
      return 24 * 60 * 60 * 1000; // 24 hours

    case CheckFrequency.MORNING: {
      // Schedule for 8 AM
      const target = new Date(now);
      target.setHours(8, 0, 0, 0);

      // If it's already past 8 AM, schedule for tomorrow
      if (now > target) {
        target.setDate(target.getDate() + 1);
      }

      return target.getTime() - now.getTime();
    }

    case CheckFrequency.EVENING: {
      // Schedule for 8 PM
      const target = new Date(now);
      target.setHours(20, 0, 0, 0);

      // If it's already past 8 PM, schedule for tomorrow
      if (now > target) {
        target.setDate(target.getDate() + 1);
      }

      return target.getTime() - now.getTime();
    }

    case CheckFrequency.MIDNIGHT: {
      // Schedule for midnight
      const target = new Date(now);
      target.setHours(0, 0, 0, 0);

      // Midnight is always for the next day
      target.setDate(target.getDate() + 1);

      return target.getTime() - now.getTime();
    }

    default:
      return 24 * 60 * 60 * 1000; // Default to daily
  }
}
