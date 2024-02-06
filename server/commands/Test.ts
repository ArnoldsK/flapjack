import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"

export default class TestCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("test")
    .setDescription("test")

  async execute() {
    this.reply({
      // ephemeral:true,
      embeds: [
        {
          title: "test <:Coins10000:1204533924559065099> test",
          description: "test <:Coins10000:1204533924559065099> test",
          footer: {
            text: "test <:Coins10000:1204533924559065099> test",
          },
        },
      ],
    })
  }
}
