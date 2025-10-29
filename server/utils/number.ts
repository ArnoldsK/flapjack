import { assert } from "~/server/utils/error"

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(Math.min(value, Math.max(min, max)), Math.min(min, max))
}

export const range = (
  value: number,
  minA: number,
  maxA: number,
  minB: number,
  maxB: number,
): number => {
  return clamp(
    minB + ((value - minA) * (maxB - minB)) / (maxA - minA),
    minB,
    maxB,
  )
}

/**
 * Returns increase/reduction percentage, e.g. "+20%"
 */
export const getPercentageChangeString = ({
  initial,
  current,
}: {
  initial: number
  current: number
}): string => {
  const percentageChange = Math.round(((current - initial) / initial) * 100)
  const sign = percentageChange > 0 ? "+" : ""

  return `${sign}${percentageChange}%`
}

export const multiplyBigInt = (
  value: number | bigint,
  multi: number,
): bigint => {
  if (typeof value !== "number") {
    value = Number(value)
  }

  return BigInt(Math.round(value * multi))
}

/**
 * The native Number.toFixed() returns a rounded number, which is not always wanted!
 */
export const toFixedDecimals = (value: number, decimals: number): number => {
  assert(decimals >= 0, "Decimals must be non-negative")

  const [whole, fraction] = String(value).split(".")
  const result = `${whole}.${(fraction ?? "").slice(0, decimals)}`

  return Number.parseFloat(result)
}
