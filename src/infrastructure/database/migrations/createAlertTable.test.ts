import { QueryRunner } from "typeorm";
import { CreateAlertTable1681234567890 } from "./createAlertTable";

describe("CreateAlertTable1681234567890 Migration", () => {
  let migration: CreateAlertTable1681234567890;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    // given
    migration = new CreateAlertTable1681234567890();

    mockQueryRunner = {
      query: jest.fn(),
    } as unknown as jest.Mocked<QueryRunner>;
  });

  it("should run the correct SQL in the up migration", async () => {
    // when
    await migration.up(mockQueryRunner);

    // then
    expect(mockQueryRunner.query).toHaveBeenCalledTimes(2);

    // First call: enable uuid-ossp
    expect(mockQueryRunner.query).toHaveBeenNthCalledWith(
      1,
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    );

    // Second call: create enum, table, index
    const secondCallArg = mockQueryRunner.query.mock.calls[1][0];

    expect(secondCallArg).toContain(`CREATE TYPE check_frequency_enum AS ENUM`);
    expect(secondCallArg).toContain(`CREATE TABLE alerts`);
    expect(secondCallArg).toContain(
      `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`,
    );
    expect(secondCallArg).toContain(`product_url VARCHAR NOT NULL`);
    expect(secondCallArg).toContain(`desired_price DECIMAL(10, 2) NOT NULL`);
    expect(secondCallArg).toContain(
      `check_frequency check_frequency_enum NOT NULL DEFAULT 'daily'`,
    );
    expect(secondCallArg).toContain(
      `CREATE INDEX idx_alerts_product_url ON alerts(product_url)`,
    );
  });

  it("should run the correct SQL in the down migration", async () => {
    // when
    await migration.down(mockQueryRunner);

    // then
    expect(mockQueryRunner.query).toHaveBeenCalledTimes(1);
    const callArg = mockQueryRunner.query.mock.calls[0][0];

    expect(callArg).toContain(`DROP TABLE alerts`);
    expect(callArg).toContain(`DROP TYPE check_frequency_enum`);
  });
});
