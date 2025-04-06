/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyInstance } from "fastify";
import { PriceCheckService } from "../services/price-check.service";

declare module "fastify" {
  interface FastifyInstance {
    priceCheckService: PriceCheckService;
  }
}
