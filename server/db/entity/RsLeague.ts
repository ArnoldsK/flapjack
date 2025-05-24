import { Entity, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export class RsLeagueEntity {
  @PrimaryKey()
  userId: string

  @Property()
  name: string
}
