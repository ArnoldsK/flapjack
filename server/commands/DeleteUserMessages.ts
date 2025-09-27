import { SlashCommandBuilder } from "discord.js"

import { DISCORD_IDS } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { UserMessageModel } from "~/server/db/model/UserMessage"
import { permission, PermissionFlags } from "~/server/utils/permission"

enum OptionName {
  User = "user",
}

export default class DeleteUserMessagesCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("delete_user_messages")
    .setDescription(
      "Delete user's messages that are referenced in the database",
    )
    .addUserOption((option) =>
      option
        .setName(OptionName.User)
        .setDescription("User to delete messages for")
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

    const user = this.interaction.options.getUser(OptionName.User, true)

    const model = new UserMessageModel(this.context)
    const entities = await model.getByUserId(user.id)

    if (entities.length === 0) {
      this.reply({
        ephemeral: true,
        content: "No messages found for this user",
      })
      return
    }

    // Defer reply
    await this.interaction.deferReply()

    // Intentionally use for loop to avoid rate limits
    for (const entity of entities) {
      await model.deleteAndRemove(entity)
    }

    await this.editReply({
      content: `Deleted ${entities.length} messages for <@${user.id}>`,
    })
  }
}
