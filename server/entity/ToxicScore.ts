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

  @Column({ type: "tinyint", nullable: true })
  isToxic: boolean | null

  @CreateDateColumn()
  createdAt: Date
}
