import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "~/server/base/Command"
import { permission, PermissionFlags } from "~/server/utils/permission"

export default class PingCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Get latency information")

  static permissions = permission({
    type: "allow",
    permissions: [PermissionFlags.Administrator],
  })

  async execute() {
    const sent = await this.reply({
      content: "Pinging...",
      fetchReply: true,
      ephemeral: true,
    })

    if (sent) {
      const latency = sent.createdTimestamp - this.interaction.createdTimestamp
      this.editReply(`Roundtrip latency: ${latency}ms`)
    }
  }
}
