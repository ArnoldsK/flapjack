import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"

export default class PollCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("poll")
    .setDescription("How to create a poll")

  async execute() {
    this.reply({
      ephemeral: true,
      content: "https://i.imgur.com/kx5l307.png",
    })
  }
}
