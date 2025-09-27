import { Entity, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export class UserMessageEntity {
  @PrimaryKey()
  messageId: string

  @Property()
  userId: string

  @Property()
  channelId: string

  @Property()
  createdAt: Date
}
