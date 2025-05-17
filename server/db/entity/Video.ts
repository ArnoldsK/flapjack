import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity()
export class VideoEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: string

  @Column()
  userDisplayName: string

  @Column()
  channelId: string

  @Column()
  messageId: string

  @Column()
  videoUrl: string

  @Column()
  videoId: string

  @Column()
  title: string

  @Column({ type: "varchar", nullable: true })
  deArrowTitle: string | null

  @Column()
  thumbnailUrl: string

  @Column()
  authorName: string

  @Column()
  authorUrl: string

  @CreateDateColumn()
  createdAt: Date
}
