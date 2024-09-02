import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm"

export enum ToxicScoreStatus {
  Failed = "failed",
  Completed = "completed",
}

@Entity()
export default class ToxicScoreEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  userId: string

  @Column({ nullable: true })
  replyUserId: string | null

  @Column()
  channelId: string

  @Column()
  messageId: string

  @Column({ type: "text" })
  content: string

  @Column({ type: "varchar", nullable: true })
  remoteBatchId: string | null

  @Column({ type: "varchar", nullable: true })
  status: ToxicScoreStatus | null

  @Column({ type: "text", nullable: true })
  response: string | null

  @CreateDateColumn()
  createdAt: Date
}
