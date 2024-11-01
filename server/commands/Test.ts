import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { permission, PermissionFlags } from "../utils/permission"
import { mcStatus } from "../cron/tasks/mcStatus"

export class TestCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("test")
    .setDescription("test")

  static permissions = permission({
    type: "allow",
    permissions: [PermissionFlags.Administrator],
  })

  async execute() {
    await mcStatus(this.context)

    this.reply({
      ephemeral: true,
      content: "yeet",
    })
  }
}
