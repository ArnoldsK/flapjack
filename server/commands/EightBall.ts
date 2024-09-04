import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { randomValue } from "../utils/random"
import { joinAsLines } from "../utils/string"
import { parseMentions } from "../utils/message"

enum OptionName {
  Question = "question",
}

export default class EightBallCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball a question")
    .addStringOption((option) =>
      option
        .setName(OptionName.Question)
        .setDescription("The answer is guaranteed to be true, no cap")
        .setRequired(true),
    )

  async execute() {
    const input = this.interaction.options.getString(OptionName.Question, true)
    const question = parseMentions(
      input.replace(/\?$/, "").concat("?"),
      this.guild,
    )

    this.reply(joinAsLines(`> ${question}`, this.#getAnswer()))
  }

  #getAnswer() {
    const answers = [
      // Positive
      "tas ir skaidrs.",
      "tas noteikti ir tā.",
      "bez šaubām.",
      "jā - noteikti.",
      "vari paļauties uz to.",
      "kā es to redzu, jā.",
      "visticamāk.",
      "perspektīva laba.",
      "jā.",
      "zīmes norāda uz jā.",
      // Neutral
      "<:nez:539510347053400065>",
      "tev tik pateikt",
      // Negative
      "nerēķinies ar to.",
      "mana atbilde ir nē.",
      "mani avoti saka nē.",
      "perspektīva nav tik laba.",
      "ļoti apšaubāms.",
    ]

    return randomValue(answers)!
  }
}
