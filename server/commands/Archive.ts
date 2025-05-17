import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { PermissionFlags, permission } from "../utils/permission"
import { Color, DISCORD_IDS } from "../../constants"
import { isTextChannel } from "../utils/channel"

export default class ArchiveCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("archive")
    .setDescription("Archives the current channel")

  static permissions = permission({
    type: "allow",
    permissions: [PermissionFlags.ManageChannels],
  })

  async execute() {
    if (!isTextChannel(this.channel)) {
      this.fail("Unable to archive this channel")
      return
    }

    // ! Defer
    await this.interaction.deferReply()

    await this.channel.setParent(DISCORD_IDS.categories.archive, {
      // Sync permissions
      lockPermissions: true,
    })

    await this.channel.setPosition(0)

    this.editReply({
      embeds: [
        {
          description: "Channel has been archived",
          color: Color.black,
        },
      ],
    })
  }
}
