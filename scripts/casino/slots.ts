import { randomValue } from "~/server/utils/random"

class SlotsCommand {
  async execute(amount: number) {
    const winningEmojis = [...Array.from({ length: 3 }).keys()].map(() => {
      const item = randomValue(this.#distribution)!
      return item.emoji
    })
    const reward = this.#getReward(winningEmojis)

    const winMulti = reward ? reward.multiplier : 0
    const winAmount = amount * winMulti

    return winAmount
  }

  #getReward(emojis: string[]) {
    // Reverse is used to validate e.g. 3 cherries before 2 cherries roll
    const rewards = [...this.#rewards].reverse()

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

  get #distribution() {
    const column = []

    for (const item of this.#items) {
      for (let i = 0; i < item.distribution; i++) {
        column.push(item)
      }
    }

    return column
  }

  get #rewards() {
    return [
      { label: "2x", multiplier: 2, name: "cherries", count: 1 },
      { label: "5x", multiplier: 5, name: "cherries", count: 2 },
      { label: "20x", multiplier: 20, name: "cherries", count: 3 },
      { label: "40x", multiplier: 40, name: "seven", count: 3 },
      { label: "80x", multiplier: 80, name: "dream", count: 3 },
    ]
  }

  get #items() {
    return [
      {
        name: "filler1",
        distribution: 5,
        emoji: "💩",
      },
      {
        name: "filler2",
        distribution: 4,
        emoji: "🕸️",
      },
      {
        name: "filler3",
        distribution: 3,
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

const run = async () => {
  const command = new SlotsCommand()

  const count = 1_000_000
  let winCount = 0
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
      winCount++
    } else {
      lossCount++
    }
  }

  console.log(`${count}x runs`)
  console.log(`credits: ${total} (starting from 0, betting 1)`)
  console.log(`lowest: ${lowest} (consecutive losses)`)
  console.log(`${winCount} wins (${Math.round((winCount / count) * 100)}%)`)
  console.log(`${lossCount} losses (${Math.round((lossCount / count) * 100)}%)`)
}

run()
