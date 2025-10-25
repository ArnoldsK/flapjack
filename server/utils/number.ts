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

/**
 * Scales width and height to at most one max dimension.
 *
 * @example
 * scaleToMax(300, 100, 10) // { width: 10, height: 3 }
 */
export const scaleToMax = (
  width: number,
  height: number,
  maxDimension: number,
): {
  width: number
  height: number
  scaleFactor: number
} => {
  const scaleFactor = maxDimension / Math.max(width, height)

  return {
    width: Math.round(width * scaleFactor),
    height: Math.round(height * scaleFactor),
    scaleFactor,
  }
}

/**
 * Scales width and height to match given height exactly.
 */
export const scaleToHeight = (
  width: number,
  height: number,
  targetHeight: number,
): {
  width: number
  height: number
  scaleFactor: number
} => {
  const scaleFactor = targetHeight / height

  return {
    width: Math.round(width * scaleFactor),
    height: Math.round(height * scaleFactor),
    scaleFactor,
  }
}
