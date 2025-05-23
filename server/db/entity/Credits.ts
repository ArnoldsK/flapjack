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

  @Property()
  updatedAt: Date & Opt = new Date()
}
