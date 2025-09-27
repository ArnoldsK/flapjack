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

  async getByUser(userId: string, options?: { before?: Date }) {
    const filter: FilterQuery<UserMessageEntity> = { userId }

    if (options?.before) {
      filter.createdAt = { $lt: options.before }
    }

    return await this.em.find(this.Entity, filter)
  }

  async handleDelete(entity: UserMessageEntity) {
    try {
      const channels = this.context.guild().channels
      const channel =
        channels.cache.get(entity.channelId) ??
        (await channels.fetch(entity.channelId))

      if (!channel?.isTextBased()) {
        throw new Error("Channel not found")
      }

      const message = await channel.messages.fetch(entity.messageId)
      if (message) {
        await message.delete()
      }
    } catch {
      // Ignore errors
    }

    await this.em.removeAndFlush(entity)
  }
}
