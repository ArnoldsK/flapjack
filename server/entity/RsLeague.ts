import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm"

@Entity()
export default class RsLeagueEntity extends BaseEntity {
  @PrimaryColumn({
    unique: true,
  })
  userId: string

  @Column()
  name: string
}
