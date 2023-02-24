import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { permission, PermissionFlags } from "../helpers/permission"

export class Ping extends BaseCommand {
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
    const latency = sent.createdTimestamp - this.interaction.createdTimestamp

    this.editReply(`Roundtrip latency: ${latency}ms`)
  }
}
