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
    decimals: number
  }> = [
    {
      from: 0,
      to: 9999,
      suffix: null,
      multiplier: 1,
      decimals: 0,
    },
    {
      from: 10_000,
      to: 999_999,
      suffix: "K",
      multiplier: 1000,
      decimals: 1,
    },
    {
      from: 1_000_000,
      to: 9_999_999,
      suffix: "M",
      multiplier: 1_000_000,
      decimals: 2,
    },
    {
      from: 10_000_000,
      to: 99_999_999,
      suffix: "M",
      multiplier: 1_000_000,
      decimals: 1,
    },
    {
      from: 100_000_000,
      to: 999_999_999,
      suffix: "M",
      multiplier: 1_000_000,
      decimals: 0, // By this point we don't care about decimals
    },
    {
      from: 1_000_000_000,
      to: 999_999_999_999,
      suffix: "B",
      multiplier: 1_000_000_000,
      decimals: 0,
    },
    {
      from: 1_000_000_000_000,
      to: Infinity,
      suffix: "T",
      multiplier: 1_000_000_000_000,
      decimals: 0,
    },
  ]

  const item = items.find(({ from, to }) => {
    return value >= from && value <= to
  })

  const divider = item?.multiplier ?? 1
  const amount =
    toFixedDecimals(value / divider, item?.decimals ?? 0) *
    (isNegative ? -1 : 1)

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
