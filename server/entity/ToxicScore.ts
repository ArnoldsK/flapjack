import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  CreateDateColumn,
} from "typeorm"

@Entity()
export default class ToxicScoreEntity extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column()
  userId: string

  @Column()
  score: number

  @Column()
  info: string

  @CreateDateColumn()
  createdAt: Date
}
