import { DEFAULT_ENVIRONMENT } from "../constants";

describe("DEFAULT_ENVIRONMENT", () => {
  it('should be "dev"', () => {
    // given
    const expectedValue = "dev";

    // when
    const actualValue = DEFAULT_ENVIRONMENT;

    // then
    expect(actualValue).toBe(expectedValue);
  });
});
