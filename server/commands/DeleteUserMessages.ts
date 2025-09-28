import { SlashCommandBuilder } from "discord.js"

import { DISCORD_IDS } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { UserMessageModel } from "~/server/db/model/UserMessage"
import { permission, PermissionFlags } from "~/server/utils/permission"
import { asPlural } from "~/server/utils/string"

enum OptionName {
  UserId = "user_id",
  Confirmation = "confirmation",
}

const BATCH_SIZE = 100
const CONCURRENCY = 5

export default class DeleteUserMessagesCommand extends BaseCommand {
  static version = 2

  static command = new SlashCommandBuilder()
    .setName("delete_user_messages")
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

    const userId = this.interaction.options.getString(OptionName.UserId, true)
    const confirmation = this.interaction.options.getString(
      OptionName.Confirmation,
      true,
    )

    if (confirmation !== "DELETE") {
      this.reply({
        ephemeral: true,
        content: 'You must type "DELETE" to confirm',
      })
      return
    }

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

    let entities = await model.getBatchByUserId(userId, BATCH_SIZE)

    while (entities.length > 0) {
      for (let i = 0; i < entities.length; i += CONCURRENCY) {
        const slice = entities.slice(i, i + CONCURRENCY)

        await Promise.all(
          slice.map((entity) =>
            model.deleteAndRemove(entity).catch(() => null),
          ),
        )
      }

      entities = await model.getBatchByUserId(userId, BATCH_SIZE)
    }

    await message.reply("Deleted all messages!")
  }
}
