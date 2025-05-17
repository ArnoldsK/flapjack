import { Unicode } from "../../constants"

export const getCreditsEmoji = (value: bigint | number): string => {
  const minValueMap = {
    "<:Coins10000:1204533924559065099>": 100_000,
    "<:Coins1000:1204533922923548753>": 10_000,
    "<:Coins250:1204533921652412487>": 2_500,
    "<:Coins100:1204533919073042432>": 1_00,
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

export const formatCredits = (value: bigint | number): string => {
  if (typeof value === "number") {
    value = Math.floor(value)
  }

  const items = [
    {
      from: BigInt("1"),
      to: BigInt("99999"),
      suffix: "",
      multiplier: BigInt("1"),
    },
    {
      from: BigInt("100000"),
      to: BigInt("9999999"),
      suffix: "K",
      multiplier: BigInt("1000"),
    },
    {
      from: BigInt("10000000"),
      to: BigInt("9999999999"),
      suffix: "M",
      multiplier: BigInt("1000000"),
    },
    {
      from: BigInt("10000000000"),
      to: BigInt("9999999999999"),
      suffix: "B",
      multiplier: BigInt("1000000000"),
    },
    {
      from: BigInt("10000000000000"),
      to: BigInt("9999999999999999"),
      suffix: "T",
      multiplier: BigInt("1000000000000"),
    },
    {
      from: BigInt("10000000000000000"),
      to: Infinity,
      suffix: "Q",
      multiplier: BigInt("1000000000000000"),
    },
  ]

  const item = items.find(({ from, to }) => {
    return value >= from && value < to
  })

  const amount = Math.floor(
    Number(BigInt(value) / (item?.multiplier ?? BigInt(1))),
  )

  if (!amount) {
    return "no credits"
  }

  return [
    amount,
    item?.suffix,
    value >= 30 ? Unicode.thinSpace : null,
    getCreditsEmoji(value) || null,
  ].join("")
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
    amount = parseFloat(value) * 1_000
  } else if (value.endsWith("m")) {
    amount = parseFloat(value) * 1_000_000
  } else {
    amount = parseInt(value)
  }

  amount = Math.floor(amount)
  amount = Math.max(0, Math.min(Math.floor(amount), Number(max)))

  if (Number.isNaN(amount)) {
    throw new Error("Invalid amount format")
  }

  if (amount <= 0) {
    throw new Error("The amount is not positive")
  }

  return amount
}
