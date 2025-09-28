import { FilterQuery } from "@mikro-orm/core"
import { Message } from "discord.js"

import { BaseModel } from "~/server/base/Model"
import { UserMessageEntity } from "~/server/db/entity/UserMessage"

export class UserMessageModel extends BaseModel {
  protected override Entity = UserMessageEntity

  async create(message: Message) {
    if (message.author.bot) return

    await this.em.create(this.Entity, {
      messageId: message.id,
      userId: message.author.id,
      channelId: message.channel.id,
      createdAt: message.createdAt,
    })
    await this.em.flush()
  }

  async getCountByUserId(userId: string) {
    return await this.em.count(this.Entity, { userId })
  }

  async getBatchByUserId(
    userId: string,
    options: {
      limit: number
      channelId?: string
    },
  ) {
    const where: FilterQuery<UserMessageEntity> = { userId }

    if (options.channelId) {
      where.channelId = options.channelId
    }

    return await this.em.find(this.Entity, where, {
      orderBy: { createdAt: "ASC" },
      limit: options.limit,
    })
  }

  /**
   * Removes the message record from the database.
   */
  async removeByMessageId(messageId: string) {
    await this.em.nativeDelete(this.Entity, { messageId })
  }

  /**
   * Removes the message from Discord and from the database.
   */
  async deleteAndRemove(entity: UserMessageEntity) {
    try {
      const channels = this.context.guild().channels
      const channel =
        channels.cache.get(entity.channelId) ??
        (await channels.fetch(entity.channelId))

      if (!channel?.isTextBased()) {
        throw new Error("Channel not found")
      }

      await channel.messages.delete(entity.messageId)
    } catch {
      // Ignore errors
    }

    await this.em.removeAndFlush(entity)
  }
}
