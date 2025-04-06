import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAlertTable1681234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First enable the uuid-ossp extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE check_frequency_enum AS ENUM ('hourly', 'daily', 'morning', 'evening', 'midnight');
      
      CREATE TABLE alerts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_url VARCHAR NOT NULL,
        desired_price DECIMAL(10, 2) NOT NULL,
        check_frequency check_frequency_enum NOT NULL DEFAULT 'daily',
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_checked_at TIMESTAMP,
        last_notified_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
      
      -- Create index on product_url for faster lookups
      CREATE INDEX idx_alerts_product_url ON alerts(product_url);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE alerts;
      DROP TYPE check_frequency_enum;
    `);
  }
}
