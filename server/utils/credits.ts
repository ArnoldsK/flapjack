import { Unicode } from "../constants"

export const formatCredits = (value: bigint | number): string => {
  const formatter = Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
  const amount = formatter.format(value)

  return `${Unicode.credits}${amount}`
}
