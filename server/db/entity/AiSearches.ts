import { Entity, Opt, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export class AiSearchesEntity {
  @PrimaryKey({ autoincrement: true })
  id: number & Opt

  @Property({ type: "text" })
  query: string

  @Property()
  createdAt: Date & Opt = new Date()
}
