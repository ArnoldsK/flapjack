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

export const isGoodScarabPrice = (chaosValue: number): boolean => {
  const roundedPrecisionValue = Math.round(chaosValue * 10) / 10

  return roundedPrecisionValue >= 1
}

export const isBadScarabPrice = (chaosValue: number): boolean => {
  const roundedPrecisionValue = Math.round(chaosValue * 10) / 10

  return roundedPrecisionValue < 0.5
}

export const formatScarabPrice = (chaosValue: number): string => {
  // 1. Handle values >= 1 (Return the integer part)
  if (chaosValue >= 1) {
    return `${Math.floor(chaosValue)}c`
  }

  // 2. Handle values < 1 (Convert to a simplified fraction)

  // a. GCD helper function (Euclidean Algorithm)
  const gcd = (a: number, b: number): number => {
    return b ? gcd(b, a % b) : a
  }

  // b. Find a suitable denominator and numerator
  // We multiply by a power of 10 until the value is an integer (e.g., for 0.75, we multiply by 100 to get 75).
  // The max power of 10 (e.g., 1,000,000) limits the precision.
  const precision = 10
  const numerator = Math.round(chaosValue * precision)
  const denominator = precision

  // c. Simplify the fraction using GCD
  const commonDivisor = gcd(numerator, denominator)
  const simpleNumerator = numerator / commonDivisor
  const simpleDenominator = denominator / commonDivisor

  // d. Return the simplified fraction string
  return `${simpleNumerator}c/${simpleDenominator}`.replace(/^1c\/1$/, "1c")
}
