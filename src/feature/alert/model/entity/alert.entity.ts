import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base.entity";
import { CheckFrequency } from "../enum/checkFrequency.enum";

@Entity("alerts")
export class Alert extends BaseEntity {
  @Column()
  productUrl!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  desiredPrice!: number;

  @Column({
    type: "enum",
    enum: CheckFrequency,
    default: CheckFrequency.DAILY,
  })
  checkFrequency!: CheckFrequency;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  lastCheckedAt!: Date;

  @Column({ nullable: true })
  lastNotifiedAt!: Date;

  @Column({ nullable: true })
  userId!: string; // For future user authentication
}
