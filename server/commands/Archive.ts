import { SlashCommandBuilder } from "discord.js"

import { Color, DISCORD_IDS } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { isTextChannel } from "~/server/utils/channel"
import { assert } from "~/server/utils/error"
import { PermissionFlags, permission } from "~/server/utils/permission"

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
    assert(isTextChannel(this.channel), "Unable to archive this channel")

    await this.channel.setParent(DISCORD_IDS.categories.archive, {
      // Sync permissions
      lockPermissions: true,
    })

    await this.channel.setPosition(0)

    this.reply({
      embeds: [
        {
          description: "Channel has been archived",
          color: Color.black,
        },
      ],
    })
  }
}
