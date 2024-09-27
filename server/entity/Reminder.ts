import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity()
class ReminderEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  channelId: string

  @Column()
  messageId: string

  @Column()
  userId: string

  @Column({ type: "text" })
  value: string

  @Column()
  expiresAt: Date

  @CreateDateColumn()
  createdAt: Date
}

export { ReminderEntity }
