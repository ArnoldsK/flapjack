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
