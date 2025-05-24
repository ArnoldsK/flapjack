import { Entity, Opt, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export class StatsEntity {
  @PrimaryKey({ autoincrement: true })
  id: number & Opt

  @Property()
  channelId: string

  @Property()
  userId: string

  @Property({
    type: "int",
    precision: 10,
  })
  timestamp: number & Opt = Math.floor(Date.now() / 1000)
}
