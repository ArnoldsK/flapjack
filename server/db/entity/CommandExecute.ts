import { Entity, Opt, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export class CommandExecuteEntity {
  @PrimaryKey({ autoincrement: true })
  id: number & Opt

  @Property()
  userId: string

  @Property()
  channelId: string

  @Property()
  commandName: string

  @Property({ type: "text" })
  input: string

  @Property()
  createdAt: Date & Opt = new Date()
}
