import { ChannelType, SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { PermissionFlags, permission } from "../utils/permission"
import { Color } from "../constants"
import { appConfig } from "../config"

export default class Archive extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("archive")
    .setDescription("Archives the current channel")

  static permissions = permission({
    type: "allow",
    permissions: [PermissionFlags.ManageChannels],
  })

  async execute() {
    if (this.channel.type !== ChannelType.GuildText) {
      this.fail("Unable to archive this channel")
      return
    }

    await this.channel.setParent(appConfig.discord.ids.categories.archive, {
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
