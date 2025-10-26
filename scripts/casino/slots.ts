import { randomInt, randomValue } from "~/server/utils/random"

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
    // Try winning the first 50% chance reward
    const firstReward = this.#rewards[0]!
    if (randomInt(0, 100) < firstReward.chance) {
      // Try winning any of the next ones
      const extraRoll = randomInt(0, 100)
      const extraReward = this.#rewards
        .slice(1)
        .reverse()
        .find((el) => extraRoll < el.chance)

      return extraReward ?? firstReward
    }

    return null
  }

  get #rewards(): SlotsReward[] {
    return [
      {
        label: "2x",
        chance: 50,
        emoji: "🍒",
        count: 1,
      },
      {
        label: "5x",
        chance: 10,
        emoji: "🍒",
        count: 2,
      },
      {
        label: "20x",
        chance: 5,
        emoji: "🍒",
        count: 3,
      },
      {
        label: "40x",
        chance: 2.5,
        emoji: "<:slotsseven:1205175066170626098>",
        count: 3,
      },
      {
        label: "80x",
        chance: 1.25,
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
