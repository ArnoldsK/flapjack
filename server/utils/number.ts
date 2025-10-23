export const clamp = (value: number, a: number, b: number): number => {
  return Math.max(Math.min(value, Math.max(a, b)), Math.min(a, b))
}

export const interpolate = (
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
