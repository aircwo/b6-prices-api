import { FastifyInstance } from "fastify";
import fastify from "fastify";
import { PriceCheckService } from "../../feature/alert/service/priceCheck.service";

describe("Fastify Type Extension", () => {
  let app: FastifyInstance;
  let mockPriceCheckService: PriceCheckService;

  beforeEach(() => {
    mockPriceCheckService = {
      checkPrice: jest.fn(),
      initialize: jest.fn(),
      cleanup: jest.fn(),
    } as unknown as PriceCheckService;
    app = fastify();
    app.decorate("priceCheckService", mockPriceCheckService);
  });

  afterEach(async () => {
    await app.close();
  });

  it("should allow accessing priceCheckService on FastifyInstance", () => {
    // This test verifies that TypeScript recognizes the property
    // If the type declaration is incorrect, this would cause a TypeScript error
    // given // when // then
    expect(app.priceCheckService).toBeDefined();
    expect(app.priceCheckService).toBe(mockPriceCheckService);
  });

  it("should allow calling methods on priceCheckService", async () => {
    // given
    const productId = "123";
    (app.priceCheckService.checkPrice as jest.Mock).mockResolvedValue({
      productId: productId,
    });

    // when
    const result = await app.priceCheckService.checkPrice(productId);

    // then
    expect(app.priceCheckService.checkPrice).toHaveBeenCalledWith(productId);
    expect(result).toEqual({
      productId: productId,
    });
  });

  it("should maintain the priceCheckService through request handlers", async () => {
    // given
    const productId = "456";
    app.get("/check-price/:id", async (request) => {
      const { id } = request.params as { id: string };
      const priceInfo = await app.priceCheckService.checkPrice(id);
      return priceInfo;
    });

    // Mock the checkPrice method to return a value
    (app.priceCheckService.checkPrice as jest.Mock).mockResolvedValue({
      productId: productId,
    });

    // when
    const response = await app.inject({
      method: "GET",
      url: "/check-price/" + productId,
    });

    // then
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({
      productId: productId,
    });
    expect(app.priceCheckService.checkPrice).toHaveBeenCalledWith(productId);
  });

  it("should properly type the priceCheckService methods", () => {
    // TypeScript would error on these lines if the typing was incorrect
    // given / when
    const checkMethod = app.priceCheckService.checkPrice;
    const initializeMethod = app.priceCheckService.initialize;
    const cleanupMethod = app.priceCheckService.cleanup;

    // then
    expect(typeof checkMethod).toBe("function");
    expect(typeof initializeMethod).toBe("function");
    expect(typeof cleanupMethod).toBe("function");
  });
});
