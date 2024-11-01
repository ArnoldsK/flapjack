import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { Unicode } from "../constants"
import { parseMentions } from "../utils/message"

enum OptionName {
  Message = "message",
}

export class MockCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("mock")
    .setDescription("Mock your message")
    .addStringOption((option) =>
      option
        .setName(OptionName.Message)
        .setDescription("Text to be mocked")
        .setRequired(true),
    )

  async execute() {
    const input = this.interaction.options.getString(OptionName.Message, true)
    const result = parseMentions(input, this.guild)
      .split(" ")
      .map((word) =>
        word
          .split("")
          .map((letter, i) =>
            i % 2 === 0 ? letter.toLowerCase() : letter.toUpperCase(),
          )
          .join(""),
      )
      .join(" ")

    this.reply(result)
  }
}
