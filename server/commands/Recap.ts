import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"

const RECAP_YEAR = 2023

export default class Recap extends BaseCommand {
  static version = RECAP_YEAR

  static command = new SlashCommandBuilder()
    .setName("recap")
    .setDescription("Get your yearly recap")

  async execute() {
    const url = `https://pepsidog.lv/year-recap/${this.user.username}`

    this.reply({
      embeds: [
        {
          color: this.member.displayColor,
          description: `[Here's your ${RECAP_YEAR} recap](${url})`,
        },
      ],
    })
  }
}
