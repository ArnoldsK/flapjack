import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"

export default class TestCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("test")
    .setDescription("test")

  async execute() {
    this.reply({
      ephemeral: true,
      content: "Done",
    })
  }
}
