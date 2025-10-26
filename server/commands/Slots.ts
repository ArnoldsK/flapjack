import { SlashCommandBuilder } from "discord.js"

import { OPTION_DESCRIPTION_AMOUNT } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { CreditsModel } from "~/server/db/model/Credits"
import { isCasinoChannel } from "~/server/utils/channel"
import { formatCredits, parseCreditsAmount } from "~/server/utils/credits"
import { randomInt, randomValue } from "~/server/utils/random"
import { joinAsLines } from "~/server/utils/string"

// Due to 1.25 we need to make the numbers be at least 3 digits
const EXTRA_CHANCE_MULTI = 100

interface SlotsReward {
  label: string
  chance: number
  emoji: string
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

  get isEphemeral(): boolean {
    return !isCasinoChannel(this.channel)
  }

  async execute() {
    const creditsModel = new CreditsModel(this.context)
    const wallet = await creditsModel.getWallet(this.member.id)

    const rawAmount = this.interaction.options.getString(
      OptionName.Amount,
      true,
    )
    const amount = parseCreditsAmount(rawAmount, wallet.credits)

    const reward = this.#getReward()
    const emojis = this.#getEmojis(reward)

    const winMulti = reward ? Number.parseInt(reward.label) : 0
    const winAmount = amount * winMulti
    const creditsToAdd = winAmount - amount

    const newWallet = await creditsModel.modifyCredits({
      userId: this.member.id,
      byAmount: creditsToAdd,
      isCasino: true,
    })

    this.reply({
      embeds: [
        {
          color: this.member.displayColor,
          title: emojis.join(" "),
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

  #getEmojis(reward: SlotsReward | null) {
    const emojis: string[] = []

    if (reward) {
      for (let i = 0; i < reward.count; i++) {
        emojis.push(reward.emoji)
      }
      for (let i = 0; i < 3 - reward.count; i++) {
        emojis.push(randomValue(["filler1", "filler2", "filler3"])!)
      }
    } else {
      for (let i = 0; i < 3; i++) {
        emojis.push(randomValue(["filler1", "filler2", "filler3"])!)
      }
    }

    return emojis
  }

  #getReward(): SlotsReward | null {
    // Try winning the first 50% chance reward
    const firstReward = this.#rewards[0]!
    if (randomInt(0, 100) < firstReward.chance) {
      // Try winning any of the next ones
      const extraRoll = randomInt(0, 100 * EXTRA_CHANCE_MULTI)
      const extraReward = this.#rewards
        .slice(1)
        .reverse()
        .find((el) => extraRoll <= el.chance * EXTRA_CHANCE_MULTI)

      return extraReward ?? firstReward
    }

    return null
  }

  get #rewards(): SlotsReward[] {
    return [
      {
        label: "2x",
        chance: 50, // (100 / 2)
        emoji: "🍒",
        count: 1,
      },
      {
        label: "5x",
        chance: 10, // (100 / 5)
        emoji: "🍒",
        count: 2,
      },
      {
        label: "20x",
        chance: 5, // (100 / 20)
        emoji: "🍒",
        count: 3,
      },
      {
        label: "40x",
        chance: 2.5, // (100 / 40)
        emoji: "<:slotsseven:1205175066170626098>",
        count: 3,
      },
      {
        label: "80x",
        chance: 1.25, // (100 / 80)
        emoji: "<:Dreaming:712788218319339581>",
        count: 3,
      },
    ]
  }
}
