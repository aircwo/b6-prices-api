import { CreateAlertDTO } from "../model/dto/createAlert.dto";
import { Alert } from "../model/entity/alert.entity";
import { Product } from "../model/interface/product.interface";
import { AlertRepository } from "../repository/alert.repository";
import fs from "fs/promises";
import path from "path";

export class AlertService {
  /**
   * Create a new price alert
   */
  async createAlert(data: CreateAlertDTO): Promise<Alert> {
    const alert = new Alert();
    alert.productUrl = data.productUrl;
    alert.desiredPrice = data.desiredPrice;
    alert.checkFrequency = data.checkFrequency;

    return AlertRepository.save(alert);
  }

  /**
   * Get all alerts
   */
  async getAllAlerts(): Promise<Alert[]> {
    return AlertRepository.find();
  }

  /**
   * Get alert by ID
   */
  async getAlertById(id: string): Promise<Alert | null> {
    return AlertRepository.findOneBy({ id });
  }

  /**
   * Update an existing alert
   */
  async updateAlert(
    id: string,
    data: Partial<CreateAlertDTO>,
  ): Promise<Alert | null> {
    const alert = await this.getAlertById(id);

    if (!alert) {
      return null;
    }

    // Update properties
    if (data.productUrl) alert.productUrl = data.productUrl;
    if (data.desiredPrice) alert.desiredPrice = data.desiredPrice;
    if (data.checkFrequency) alert.checkFrequency = data.checkFrequency;

    return AlertRepository.save(alert);
  }

  /**
   * Delete an alert
   */
  async deleteAlert(id: string): Promise<boolean> {
    const result = await AlertRepository.delete(id);
    return result.affected === 1;
  }

  /**
   * Fetch product data from the static JSON file
   */
  async fetchProductData(): Promise<Product[]> {
    const filePath = path.join(process.cwd(), "data/products.json");
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  }

  /**
   * Check if the price condition is met
   */
  async checkPriceCondition(alert: Alert): Promise<boolean> {
    const products = await this.fetchProductData();

    // Find product by URL
    const product = products.find((p) => p.url === alert.productUrl);

    if (!product) {
      return false;
    }

    // Check if current price is less than or equal to desired price
    return product.currentPrice <= alert.desiredPrice;
  }
}

export const alertService = new AlertService();
