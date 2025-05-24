import { Entity, Opt, PrimaryKey, Property, Unique } from "@mikro-orm/core"

@Entity()
export class PersistentThreadEntity {
  @PrimaryKey({ autoincrement: true })
  id: number & Opt

  @Property()
  channelId: string

  @Property()
  messageId: string

  @Property()
  @Unique()
  threadId: string

  @Property()
  userId: string
}
