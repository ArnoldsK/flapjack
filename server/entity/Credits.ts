import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity()
export default class CreditsEntity extends BaseEntity {
  @PrimaryColumn({
    unique: true,
  })
  userId: string

  @Column({
    type: "bigint",
    unsigned: true,
    transformer: {
      from(value: string): bigint {
        return BigInt(value)
      },
      to(value?: bigint): string {
        return value?.toString() ?? "0"
      },
    },
  })
  credits: bigint

  @Column({
    type: "bigint",
    unsigned: true,
    transformer: {
      from(value: string): bigint {
        return BigInt(value)
      },
      to(value?: bigint): string {
        return value?.toString() ?? "0"
      },
    },
  })
  banked: bigint

  @UpdateDateColumn()
  updatedAt: Date
}
