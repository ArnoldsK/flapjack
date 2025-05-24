import { Entity, Opt, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export class RedgifsEntity {
  @PrimaryKey()
  id: string & Opt

  @Property({ type: "text" })
  token: string

  @Property()
  createdAt: Date & Opt = new Date()
}
