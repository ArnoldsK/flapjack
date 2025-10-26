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
const FILLER_EMOJIS = ["💀", "🕸️", "💩"]

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
        emojis.push(randomValue(FILLER_EMOJIS)!)
      }
    } else {
      for (let i = 0; i < 3; i++) {
        emojis.push(randomValue(FILLER_EMOJIS)!)
      }
    }

    return emojis
  }

  #getReward(): SlotsReward | null {
    const firstReward = this.#rewards[0]! // This is the 2x, 50% reward

    // STEP 1: Check the 50% gate. If false, return null (50% chance).
    // Using randomInt(0, 99) gives 100 possible values (0 to 99).
    // Checking <= 49 gives a 50/100 = 50% chance.
    if (randomInt(0, 99) >= firstReward.chance) {
      return null // 50% chance of losing
    }

    // STEP 2: We are now in the 50% "Win" pool.
    // The total chance of all *better* rewards (5x, 20x, 40x, 80x) is:
    // 10 + 5 + 2.5 + 1.25 = 18.75

    // We need to roll for a chance within the remaining 18.75%
    // To properly calculate the chances, roll for a value from 0 to 9999
    const maxRoll = 100 * EXTRA_CHANCE_MULTI - 1 // 9999
    const extraRoll = randomInt(0, maxRoll)

    // Calculate the total adjusted chance for only the *extra* rewards (5x to 80x)
    const extraRewardsTotalChance = this.#rewards
      .slice(1)
      .reduce((sum, el) => sum + el.chance * EXTRA_CHANCE_MULTI, 0) // Should be 1875

    let cumulativeChance = 0

    // Check if the roll falls into the cumulative range of the better rewards
    // The extra roll only needs to be less than or equal to the total chance of those rewards (1875)
    if (extraRoll <= extraRewardsTotalChance) {
      // This is a standard weighted selection, but only among the 5x, 20x, 40x, 80x
      const extraReward = this.#rewards.slice(1).find((el) => {
        cumulativeChance += el.chance * EXTRA_CHANCE_MULTI
        return extraRoll <= cumulativeChance
      })

      return extraReward! // This will be one of 5x, 20x, 40x, or 80x
    }

    // STEP 3: The roll did not hit any of the better rewards, so the user wins the minimum 2x.
    // The chance of reaching here is 50% * (1 - 0.1875) = 40.625% of the total game.
    return firstReward
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
