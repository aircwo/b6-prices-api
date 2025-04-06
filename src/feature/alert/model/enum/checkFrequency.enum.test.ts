import { CheckFrequency } from "./checkFrequency.enum";

describe("checkFrequency enum", () => {
  it("should contain all expected frequency values", () => {
    // given
    const expectedValues = {
      TEST: "test",
      HOURLY: "hourly",
      DAILY: "daily",
      MORNING: "morning",
      EVENING: "evening",
      MIDNIGHT: "midnight",
    };

    // when
    const actualValues = {
      TEST: CheckFrequency.TEST,
      HOURLY: CheckFrequency.HOURLY,
      DAILY: CheckFrequency.DAILY,
      MORNING: CheckFrequency.MORNING,
      EVENING: CheckFrequency.EVENING,
      MIDNIGHT: CheckFrequency.MIDNIGHT,
    };

    // then
    expect(actualValues).toEqual(expectedValues);
  });

  it("should be usable for value lookup", () => {
    // given
    const value = "daily";

    // when
    const match = Object.values(CheckFrequency).includes(
      value as CheckFrequency,
    );

    // then
    expect(match).toBe(true);
  });

  it("should not include an invalid value", () => {
    // given
    const invalidValue = "weekly";

    // when
    const isValid = Object.values(CheckFrequency).includes(
      invalidValue as CheckFrequency,
    );

    // then
    expect(isValid).toBe(false);
  });
});
