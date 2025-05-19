import { SlashCommandBuilder } from "discord.js"

import { Color, OPTION_DESCRIPTION_AMOUNT } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { CreditsModel } from "~/server/db/model/Credits"
import { isCasinoChannel } from "~/server/utils/channel"
import { formatCredits, parseCreditsAmount } from "~/server/utils/credits"
import { randomValue } from "~/server/utils/random"
import { joinAsLines } from "~/server/utils/string"

enum OptionName {
  Color = "color",
  Amount = "amount",
}

type ColorKey = keyof typeof Color
const colors: Array<ColorKey> = ["red", "black", "green"]

export default class RouletteCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("roulette")
    .setDescription("Guess one of the three colors")
    .addStringOption((option) =>
      option
        .setName(OptionName.Color)
        .setDescription("Choose the color. Green is very rare.")
        .setRequired(true)
        .setChoices(
          ...colors.map((color) => ({
            name: color,
            value: color,
          })),
        ),
    )
    .addStringOption((option) =>
      option
        .setName(OptionName.Amount)
        .setDescription(OPTION_DESCRIPTION_AMOUNT)
        .setRequired(true),
    )

  async execute() {
    const color = this.interaction.options.getString(
      OptionName.Color,
      true,
    ) as ColorKey

    const creditsModel = new CreditsModel(this.member)
    const wallet = await creditsModel.getWallet()

    const rawAmount = this.interaction.options.getString(
      OptionName.Amount,
      true,
    )
    const amount = parseCreditsAmount(rawAmount, wallet.credits)

    const rolledColor = this.#getRandomColor()
    const isWin = color === rolledColor

    let winMulti = isWin ? 1 : -1
    if (isWin && color === "green") {
      winMulti = 35
    }

    const winAmount = amount * winMulti
    const newWallet = await creditsModel.addCredits(winAmount)

    this.reply({
      ephemeral: !isCasinoChannel(this.channel),
      embeds: [
        {
          description: joinAsLines(
            `**You rolled ${rolledColor} and ${
              isWin ? "won" : "lost"
            } ${formatCredits(isWin ? winAmount : amount)}**`,
            `You have ${formatCredits(newWallet.credits)} now`,
          ),
          color: Color[rolledColor],
        },
      ],
    })
  }

  get #colorFields(): Record<
    Extract<ColorKey, "green" | "red" | "black">,
    string[]
  > {
    return {
      green: ["0"],
      red: "1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36".split(","),
      black: "2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35".split(","),
    }
  }

  #getRandomColor(): ColorKey {
    const fields = Object.values(this.#colorFields).reduce((a, b) => [
      ...a,
      ...b,
    ])
    const rolledField = randomValue(fields)!

    return Object.entries(this.#colorFields)
      .filter(([, fs]) => fs.includes(rolledField))
      .map(([c]) => c)[0] as ColorKey
  }
}
