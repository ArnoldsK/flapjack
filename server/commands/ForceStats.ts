import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { permission, PermissionFlags } from "../utils/permission"
import { createDailyStats } from "../cron/tasks/createDailyStats"

export default class ForceStatsCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("force-stats")
    .setDescription("Force stats creation")

  static permissions = permission({
    type: "allow",
    permissions: [PermissionFlags.Administrator],
  })

  async execute() {
    await this.interaction.deferReply({
      ephemeral: true,
    })

    try {
      await createDailyStats(this.context)

      this.editReply("Created stats")
    } catch (error) {
      this.editReply("Failed to create stats")
      console.error("Failed to create stats", error)
    }
  }
}
