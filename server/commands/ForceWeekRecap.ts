import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { permission, PermissionFlags } from "../utils/permission"
import { createWeekRecap } from "../cron/tasks/createWeekRecap"

export default class PingCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("force-week-recap")
    .setDescription("Force a week recap creation")

  static permissions = permission({
    type: "allow",
    permissions: [PermissionFlags.Administrator],
  })

  async execute() {
    await this.interaction.deferReply({
      ephemeral: true,
    })

    try {
      await createWeekRecap(this.context)

      this.editReply("Created week recap")
    } catch (error) {
      this.editReply("Failed to create week recap")
      console.error("Failed to create week recap", error)
    }
  }
}
