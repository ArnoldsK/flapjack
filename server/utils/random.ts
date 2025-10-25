export const randomInt = (low: number, high: number): number =>
  Math.floor(Math.random() * (high - low + 1) + low)

export const randomValue = <T>(data: T[]): T | undefined => {
  // Since array is still an object, can normalize types by getting values
  const values = Object.values(data)

  return values[randomInt(0, values.length - 1)]
}

export const randomBool = (oneInNChance: number = 1): boolean => {
  if (oneInNChance > 1) {
    return randomInt(1, oneInNChance) === 1
  }

  return !!randomValue([true, false])
}

export const randomHexColor = (alpha?: string): `#${string}` => {
  const letters = "0123456789ABCDEF"
  let color = "#"
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  if (alpha) {
    color += alpha.repeat(alpha.length === 1 ? 2 : 1)
  }
  return color as `#${string}`
}
