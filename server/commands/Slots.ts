import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { CreditsModel } from "../db/model/Credits"
import { formatCredits, parseCreditsAmount } from "../utils/credits"
import { OPTION_DESCRIPTION_AMOUNT } from "../../constants"
import { randomValue } from "../utils/random"
import { isCasinoChannel } from "../utils/channel"
import { joinAsLines } from "../utils/string"

type ItemName =
  | "filler1"
  | "filler2"
  | "filler3"
  | "cherries"
  | "seven"
  | "dream"

interface SlotsItem {
  name: ItemName
  distribution: number
  emoji: string
}

interface SlotsReward {
  label: string
  multiplier: number
  name: ItemName
  count: number
}

enum OptionName {
  Amount = "amount",
}

export default class SlotsCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("slots")
    .setDescription("Spin your credits away")
    .addStringOption((option) =>
      option
        .setName(OptionName.Amount)
        .setDescription(OPTION_DESCRIPTION_AMOUNT)
        .setRequired(true),
    )

  async execute() {
    const creditsModel = new CreditsModel(this.member)
    const wallet = await creditsModel.getWallet()

    const rawAmount = this.interaction.options.getString(
      OptionName.Amount,
      true,
    )
    const amount = parseCreditsAmount(rawAmount, wallet.credits)

    const winningEmojis = [...Array(3).keys()].map(() => {
      const item = randomValue(this.#distribution)!
      return item.emoji
    })
    const reward = this.#getReward(winningEmojis)

    const winMulti = reward ? reward.multiplier : 0
    const winAmount = amount * winMulti
    const creditsToAdd = winAmount - amount

    const newWallet = await creditsModel.addCredits(creditsToAdd)

    this.reply({
      ephemeral: !isCasinoChannel(this.channel),
      embeds: [
        {
          title: winningEmojis.join(" "),
          description: joinAsLines(
            reward
              ? `**Won ${formatCredits(winAmount)} (${reward.label})**`
              : `**You got nothing and lost ${formatCredits(amount)}**`,
            `You have ${formatCredits(newWallet.credits)} now`,
          ),
        },
      ],
    })
  }

  #getReward(emojis: string[]): SlotsReward | null {
    // Reverse is used to validate e.g. 3 cherries before 2 cherries roll
    const rewards = this.#rewards.slice().reverse()

    // Find the reward
    for (const reward of rewards) {
      const { name, count } = reward
      const item = this.#items.find((item) => item.name === name)!

      // Find matching items to rewards
      const matches = emojis.filter((emoji) => emoji === item.emoji).length

      if (matches >= count) {
        return reward
      }
    }

    return null
  }

  get #distribution(): SlotsItem[] {
    const column: SlotsItem[] = []

    for (const item of this.#items) {
      for (let i = 0; i < item.distribution; i++) {
        column.push(item)
      }
    }

    return column
  }

  get #rewards(): SlotsReward[] {
    return [
      { label: "2x", multiplier: 2, name: "cherries", count: 1 },
      { label: "5x", multiplier: 5, name: "cherries", count: 2 },
      { label: "20x", multiplier: 20, name: "cherries", count: 3 },
      { label: "40x", multiplier: 40, name: "seven", count: 3 },
      { label: "80x", multiplier: 80, name: "dream", count: 3 },
    ]
  }

  get #items(): SlotsItem[] {
    return [
      {
        name: "filler1",
        distribution: 6,
        emoji: "💩",
      },
      {
        name: "filler2",
        distribution: 6,
        emoji: "🕸️",
      },
      {
        name: "filler3",
        distribution: 6,
        emoji: "💀",
      },
      {
        name: "cherries",
        distribution: 3,
        emoji: "🍒",
      },
      {
        name: "seven",
        distribution: 1,
        emoji: "<:slotsseven:1205175066170626098>",
      },
      {
        name: "dream",
        distribution: 1,
        emoji: "<:Dreaming:712788218319339581>",
      },
    ]
  }
}
