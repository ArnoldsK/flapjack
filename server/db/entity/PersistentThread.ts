import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class PersistentThreadEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  channelId!: string

  @Column()
  messageId!: string

  @Column({ unique: true })
  threadId!: string

  @Column()
  userId!: string
}
