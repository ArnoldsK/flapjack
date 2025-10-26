import { randomInt, randomValue } from "~/server/utils/random"

// Due to 1.25 we need to make the numbers be at least 3 digits
const EXTRA_CHANCE_MULTI = 100

interface SlotsReward {
  label: string
  /** x in 100 */
  chance: number
  emoji: string
  count: number
}

class SlotsCommand {
  async execute(amount: number) {
    const reward = this.#getReward()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const emojis = this.#getEmojis(reward)

    const winMulti = reward ? Number.parseInt(reward.label) : 0
    const winAmount = amount * winMulti

    return winAmount
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

const run = async () => {
  const command = new SlotsCommand()

  const count = 1_000_000
  const winCountMap = {
    2: 0,
    5: 0,
    20: 0,
    40: 0,
    80: 0,
  }
  let lossCount = 0
  let total = 0
  let lowest = 0

  for (let i = 0; i < count; i++) {
    const winAmount = await command.execute(1)

    total += winAmount - 1
    if (total < lowest) {
      lowest = total
    }

    if (winAmount > 0) {
      winCountMap[winAmount as keyof typeof winCountMap]++
    } else {
      lossCount++
    }
  }

  console.log(`${count}x runs`)
  console.log(`credits: ${total} (starting from 0, betting 1)`)
  console.log(`lowest: ${lowest} (consecutive losses)`)
  for (const [mult, winCount] of Object.entries(winCountMap)) {
    console.log(
      `${winCount} ${mult}x wins (${Math.round((winCount / count) * 100)}%)`,
    )
  }
  console.log(`${lossCount} losses (${Math.round((lossCount / count) * 100)}%)`)
}

run()
