import { CheckFrequency } from "../../enum/checkFrequency.enum";
import { Alert } from "../alert.entity";

describe("alert entity", () => {
  it("should create an Alert instance with undefined values", () => {
    // given / when
    const alert = new Alert();

    // then
    expect(alert.productUrl).toBeUndefined();
    expect(alert.desiredPrice).toBeUndefined();
    expect(alert.checkFrequency).toBeUndefined();
    expect(alert.isActive).toBeUndefined();
    expect(alert.lastCheckedAt).toBeUndefined();
    expect(alert.lastNotifiedAt).toBeUndefined();
  });

  it("should allow setting properties manually", () => {
    // given
    const testData = {
      productUrl: "https://example.com/product",
      desiredPrice: 99.99,
      checkFrequency: CheckFrequency.MIDNIGHT,
      isActive: false,
      lastCheckedAt: new Date("2024-01-01T12:00:00Z"),
      lastNotifiedAt: new Date("2024-01-02T12:00:00Z"),
      userId: "user-123",
    };

    // when
    const alert = new Alert();
    Object.assign(alert, testData);

    // then
    expect(alert.productUrl).toBe(testData.productUrl);
    expect(alert.desiredPrice).toBe(testData.desiredPrice);
    expect(alert.checkFrequency).toBe(testData.checkFrequency);
    expect(alert.isActive).toBe(false);
    expect(alert.lastCheckedAt).toEqual(testData.lastCheckedAt);
    expect(alert.lastNotifiedAt).toEqual(testData.lastNotifiedAt);
  });
});
