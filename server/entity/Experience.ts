import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm"

@Entity()
export default class ExperienceEntity extends BaseEntity {
  @PrimaryColumn({
    unique: true,
  })
  userId: string

  @Column()
  exp: number
}
