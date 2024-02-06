import { Unicode } from "../constants"

export const formatCredits = (value: bigint | number): string => {
  const formatter = Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
  const amount = formatter.format(value)

  return `${Unicode.credits}${amount}`
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

  if (Number.isNaN(amount)) {
    throw new Error("Invalid amount format")
  }

  if (amount <= 0) {
    throw new Error("The amount is not positive")
  }

  return Math.max(0, Math.min(Math.floor(amount), Number(max)))
}
