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
  channelId: string

  @Column()
  messageId: string

  @Column({ type: "text" })
  content: string

  @Column({ type: "varchar", nullable: true })
  remoteBatchId: string | null

  @CreateDateColumn()
  createdAt: Date
}
