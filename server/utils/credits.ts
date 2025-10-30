import { Unicode } from "~/constants"
import { assert } from "~/server/utils/error"
import { multiplyBigInt, toFixedDecimals } from "~/server/utils/number"

export const getCreditsEmoji = (value: bigint | number): string => {
  const minValueMap = {
    "<:Coins10000:1204533924559065099>": 100_000,
    "<:Coins1000:1204533922923548753>": 10_000,
    "<:Coins250:1204533921652412487>": 2500,
    "<:Coins100:1204533919073042432>": 100,
    "<:Coins25:1204533917361643630>": 250,
    "<:Coins5:1204533915113496717>": 50,
    "<:Coins4:1204533896092450856>": 40,
    "<:Coins3:1204533887649194074>": 30,
    "<:Coins2:1204533886361673788>": 20,
    "<:Coins1:1204533883702612018>": 1,
  }

  return (
    Object.entries(minValueMap).find(
      ([, minValue]) => value >= minValue,
    )?.[0] ?? ""
  )
}

type AmountSuffix = "K" | "M" | "B" | "T"

export const formatCreditsAmount = (
  value: bigint | number,
): {
  amount: number
  suffix: AmountSuffix | null
} => {
  const isNegative = value < 0

  if (typeof value !== "number") {
    value = Number(value)
  }

  value = Math.abs(Math.floor(value))

  const items: Array<{
    from: number
    to: number
    suffix: AmountSuffix | null
    multiplier: number
  }> = [
    {
      from: 0,
      to: 9999,
      suffix: null,
      multiplier: 1,
    },
    {
      from: 10_000,
      to: 999_999,
      suffix: "K",
      multiplier: 1000,
    },
    {
      from: 1_000_000,
      to: 9_999_999,
      suffix: "M",
      multiplier: 1_000_000,
    },
    {
      from: 10_000_000,
      to: 99_999_999,
      suffix: "M",
      multiplier: 1_000_000,
    },
    {
      from: 100_000_000,
      to: 999_999_999,
      suffix: "M",
      multiplier: 1_000_000,
    },
    {
      from: 1_000_000_000,
      to: 999_999_999_999,
      suffix: "B",
      multiplier: 1_000_000_000,
    },
    {
      from: 1_000_000_000_000,
      to: Infinity,
      suffix: "T",
      multiplier: 1_000_000_000_000,
    },
  ]

  const item = items.find(({ from, to }) => {
    return value >= from && value <= to
  })

  const divider = item?.multiplier ?? 1
  const dividedValue = value / divider

  const integerLength = String(Math.floor(dividedValue)).length

  let decimals = 0
  if (integerLength === 1) {
    // e.g., 1.23K, 123,000 / 1000 = 123.0. integerLength is 3.
    // e.g., 1.12M, 1,123,123 / 1,000,000 = 1.123123. integerLength is 1.
    // Max 3 significant digits: 3 - 1 = 2 decimal places (e.g., 1.12)
    decimals = 2
  } else if (integerLength === 2) {
    // e.g., 12.1K, 12,123 / 1000 = 12.123. integerLength is 2.
    // Max 3 significant digits: 3 - 2 = 1 decimal place (e.g., 12.1)
    decimals = 1
  } else if (integerLength >= 3) {
    // e.g., 123K, 123,123 / 1000 = 123.123. integerLength is 3.
    // Max 3 significant digits: 3 - 3 = 0 decimal places (e.g., 123)
    decimals = 0
  }

  const amount = toFixedDecimals(dividedValue, decimals) * (isNegative ? -1 : 1)

  return {
    amount,
    suffix: item?.suffix || null,
  }
}

export const formatCredits = (
  value: bigint | number,
  options?: { withTimes?: number },
): string => {
  const { amount, suffix } = formatCreditsAmount(value)

  if (!amount) {
    return "no credits"
  }

  const emoji = getCreditsEmoji(multiplyBigInt(value, options?.withTimes ?? 1))
  const times =
    options?.withTimes && options.withTimes > 1
      ? `${Unicode.times}${options.withTimes}`
      : ""

  return [amount, suffix, times, emoji ? Unicode.thinSpace : "", emoji].join("")
}

export const parseCreditsAmount = (
  value: string,
  max: number | bigint,
): number => {
  value = value.trim().toLocaleLowerCase()

  let amount
  if (value === "all") {
    amount = Number(max)
  } else if (value.endsWith("k")) {
    amount = Number.parseFloat(value) * 1000
  } else if (value.endsWith("m")) {
    amount = Number.parseFloat(value) * 1_000_000
  } else if (value.endsWith("b")) {
    amount = Number.parseFloat(value) * 1_000_000_000
  } else {
    amount = Number.parseInt(value)
  }

  amount = Math.floor(amount)
  amount = Math.max(0, Math.min(Math.floor(amount), Number(max)))

  assert(!Number.isNaN(amount), "Invalid amount format")
  assert(amount !== 0, "No credits")
  assert(amount > 0, "The amount is not positive")

  return amount
}
