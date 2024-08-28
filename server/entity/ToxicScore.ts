import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity()
export default class ToxicScoreEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  userId: string

  @Column()
  messageId: string

  @Column()
  // TODO make a boolean
  score: number

  @Column()
  info: string

  @CreateDateColumn()
  createdAt: Date
}
