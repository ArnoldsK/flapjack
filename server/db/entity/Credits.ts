import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity()
export class CreditsEntity extends BaseEntity {
  @PrimaryColumn({
    unique: true,
  })
  userId: string

  @Column({
    type: "bigint",
    unsigned: true,
    transformer: {
      from: BigInt,
      to(value?: bigint): string {
        return value?.toString() ?? "0"
      },
    },
  })
  credits: bigint

  @UpdateDateColumn()
  updatedAt: Date
}
