import initServer from "../core/initServer";

jest.mock("../core/initServer");

describe("index", () => {
  it("should call initServer when imported", async () => {
    // given / when
    await import("../index");

    // then
    expect(initServer).toHaveBeenCalledTimes(1);
  });
});
