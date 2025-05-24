import { Entity, PrimaryKey, Opt, Property } from "@mikro-orm/core"

@Entity()
export class ReminderEntity {
  @PrimaryKey({ autoincrement: true })
  id: number & Opt

  @Property()
  channelId: string

  @Property()
  messageId: string

  @Property()
  userId: string

  @Property({ type: "text" })
  value: string

  @Property()
  expiresAt: Date

  @Property()
  createdAt: Date & Opt = new Date()
}
