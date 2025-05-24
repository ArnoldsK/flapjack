import { Entity, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export class ExperienceEntity {
  @PrimaryKey()
  userId: string

  @Property()
  exp: number
}
