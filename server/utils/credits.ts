import { Unicode } from "~/constants"
import { assert } from "~/server/utils/error"

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

  if (typeof value === "number") {
    value = Math.abs(Math.floor(value))
  } else if (isNegative) {
    value = value * -1n // abs the bigint
  }

  const items: Array<{
    from: bigint
    to: bigint | number
    suffix: AmountSuffix | null
    multiplier: bigint
    decimals: number
  }> = [
    {
      from: BigInt("0"),
      to: BigInt("9999"),
      suffix: null,
      multiplier: BigInt("1"),
      decimals: 0,
    },
    {
      from: BigInt("10000"),
      to: BigInt("999999"),
      suffix: "K",
      multiplier: BigInt("1000"),
      decimals: 1,
    },
    {
      from: BigInt("1000000"),
      to: BigInt("9999999"),
      suffix: "M",
      multiplier: BigInt("1000000"),
      decimals: 2,
    },
    {
      from: BigInt("10000000"),
      to: BigInt("99999999"),
      suffix: "M",
      multiplier: BigInt("1000000"),
      decimals: 1,
    },
    {
      from: BigInt("100000000"),
      to: BigInt("999999999"),
      suffix: "M",
      multiplier: BigInt("1000000"),
      decimals: 0, // By this point we don't care about decimals
    },
    {
      from: BigInt("1000000000"),
      to: BigInt("999999999999"),
      suffix: "B",
      multiplier: BigInt("1000000000"),
      decimals: 0,
    },
    {
      from: BigInt("1000000000000"),
      to: Infinity,
      suffix: "T",
      multiplier: BigInt("1000000000000"),
      decimals: 0,
    },
  ]

  const item = items.find(({ from, to }) => {
    return value >= from && value < to
  })

  const maxDecimals = items
    .map((i) => i.decimals)
    .reduce((a, b) => Math.max(a, b), 0)
  const decimalsMultiplier = BigInt(10 ** maxDecimals)
  const divider = item?.multiplier ?? BigInt(1)
  const amountWithMaxDecimals =
    Number((BigInt(value) * decimalsMultiplier) / divider) / 100
  const amount =
    Number.parseFloat(amountWithMaxDecimals.toFixed(item?.decimals ?? 0)) *
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

  const emoji = getCreditsEmoji(BigInt(value) * BigInt(options?.withTimes ?? 1))
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
