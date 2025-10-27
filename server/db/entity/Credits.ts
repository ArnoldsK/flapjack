import { Entity, Opt, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export class CreditsEntity {
  @PrimaryKey()
  userId: string

  @Property({
    type: "bigint",
    unsigned: true,
  })
  credits: bigint

  @Property({
    type: "tinyint",
    length: 1,
    default: 1,
  })
  multiplier: -1 | 1

  @Property({ type: "timestamp", nullable: true })
  lastMessageAt: Date | null

  @Property()
  updatedAt: Date & Opt = new Date()
}
