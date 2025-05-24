import { Entity, PrimaryKey, Property, Opt } from "@mikro-orm/core"

@Entity()
export class VideoEntity {
  @PrimaryKey()
  id: number & Opt

  @Property()
  userId: string

  @Property()
  userDisplayName: string

  @Property()
  channelId: string

  @Property()
  messageId: string

  @Property()
  videoUrl: string

  @Property()
  videoId: string

  @Property()
  title: string

  @Property({ type: "varchar", nullable: true })
  deArrowTitle: string | null

  @Property()
  thumbnailUrl: string

  @Property()
  authorName: string

  @Property()
  authorUrl: string

  @Property()
  createdAt: Date & Opt = new Date()
}
