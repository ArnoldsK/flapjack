import { ChannelType, SlashCommandBuilder } from "discord.js"

import { DISCORD_IDS } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { CacheKey } from "~/server/cache"
import { UserMessageModel } from "~/server/db/model/UserMessage"
import { dSubtractRelative } from "~/server/utils/date"
import { permission, PermissionFlags } from "~/server/utils/permission"
import { asPlural, joinAsLines } from "~/server/utils/string"
import { Nullish } from "~/types"

enum OptionName {
  UserId = "user_id",
  Confirmation = "confirmation",
  Channel = "channel",
  IgnoreChannel = "ignore_channel",
  Before = "before",
}

const BATCH_SIZE = 100
const CONCURRENCY = 5

export default class DeleteUserMessagesCommand extends BaseCommand {
  static version = 5

  static command = new SlashCommandBuilder()
    .setName("delete-user-messages")
    .setDescription(
      "Delete all messages for an user (can only be used in the logs channel)",
    )
    .addStringOption((option) =>
      option
        .setName(OptionName.UserId)
        .setDescription("User ID to delete messages for")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName(OptionName.Confirmation)
        .setDescription(
          "This action cannot be stopped. Type DELETE to confirm!",
        )
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName(OptionName.Channel)
        .setDescription("Limit messages to a single channel")
        .addChannelTypes(ChannelType.GuildText),
    )
    .addChannelOption((option) =>
      option
        .setName(OptionName.IgnoreChannel)
        .setDescription("Ignore messages from a channel")
        .addChannelTypes(ChannelType.GuildText),
    )
    .addStringOption((option) =>
      option
        .setName(OptionName.Before)
        .setDescription('Limit messages to before "1 day", "2 weeks", etc.'),
    )

  static permissions = permission({
    type: "allow",
    permissions: [PermissionFlags.Administrator],
  })

  async execute() {
    if (this.channel.id !== DISCORD_IDS.channels.logs) {
      this.reply({
        ephemeral: true,
        content: `This command can only be used in <#${DISCORD_IDS.channels.logs}>`,
      })
      return
    }

    if (this.context.cache.get(CacheKey.DeleteUserMessagesRunning)) {
      this.fail("Already deleting someone's messages")
      return
    }

    const userId = this.interaction.options.getString(OptionName.UserId, true)
    const confirmation = this.interaction.options.getString(
      OptionName.Confirmation,
      true,
    )

    const channel = this.interaction.options.getChannel(OptionName.Channel)
    const ignoreChannel = this.interaction.options.getChannel(
      OptionName.IgnoreChannel,
    )
    const before = this.interaction.options.getString(OptionName.Before)

    if (confirmation !== "DELETE") {
      this.fail('You must type "DELETE" to confirm')
      return
    }

    if (channel && ignoreChannel && channel.id === ignoreChannel.id) {
      this.fail("Can't limit to a channel that is also ignored")
      return
    }

    const beforeDate = before ? dSubtractRelative(before)?.toDate() : null
    if (before && !beforeDate) {
      this.fail("Invalid before date format")
      return
    }

    try {
      this.context.cache.set(CacheKey.DeleteUserMessagesRunning, true)

      await this.#handleRemoval({
        userId,
        channelId: channel?.id,
        ignoreChannelId: ignoreChannel?.id,
        beforeDate,
      })
    } finally {
      this.context.cache.set(CacheKey.DeleteUserMessagesRunning, false)
    }
  }

  async #handleRemoval({
    userId,
    channelId,
    ignoreChannelId,
    beforeDate,
  }: {
    userId: string
    channelId: Nullish<string>
    ignoreChannelId: Nullish<string>
    beforeDate: Nullish<Date>
  }) {
    const model = new UserMessageModel(this.context)
    const count = await model.getCountByUserId(userId)

    if (count === 0) {
      this.reply({
        ephemeral: true,
        content: "No messages found for this user",
      })
      return
    }

    const message = await this.interaction.reply({
      content: `Deleting ${asPlural(count, "message")} for <@${userId}>...`,
      fetchReply: true,
    })

    const before = beforeDate ?? new Date()

    let totalTime = 0
    let batchCount = 0

    const getBatch = () =>
      model.getBatchByUserId(userId, {
        limit: BATCH_SIZE,
        channelId,
        notChannelId: ignoreChannelId,
        before,
      })

    let entities = await getBatch()

    while (entities.length > 0) {
      const start = Date.now()

      for (let i = 0; i < entities.length; i += CONCURRENCY) {
        const slice = entities.slice(i, i + CONCURRENCY)

        await Promise.all(
          slice.map((entity) =>
            model.deleteAndRemove(entity).catch(() => null),
          ),
        )
      }

      const end = Date.now()
      totalTime += end - start
      batchCount++

      entities = await getBatch()
    }

    await message.reply(
      joinAsLines(
        "Deleted all messages!",
        batchCount > 0
          ? `-# Average ms per batch: ${totalTime / batchCount}`
          : null,
      ),
    )
  }
}
