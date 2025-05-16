import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm"

@Entity()
export class TimeoutEntity extends BaseEntity {
  @PrimaryColumn({
    unique: true,
  })
  userId: string

  @Column()
  durationMs: number

  @Column()
  until: Date
}
