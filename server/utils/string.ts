import { Unicode } from "~/constants"

export const joinAsLines = (...values: string[]) => values.join("\n")

export const ucFirst = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export const plural = (
  number: number,
  word: string,
  suffix: string = "s",
  plural?: string,
): string => {
  if (number !== 1) {
    return plural ?? `${word}${suffix}`
  }
  return word
}

export const asPlural = (
  number: number,
  word: string,
  /**
   * Use $1 for number
   * Use $2 for word
   */
  format: string,
) => {
  word = plural(number, word)

  return format.replace("$1", number.toString()).replace("$2", word)
}

export const makeEqualLengths = (
  values: string[],
  type: "before" | "after" = "after",
  voidValue = Unicode.enSpace,
): string[] => {
  const longestValue = values.reduce(
    (a, b) => (a.length > b.length ? a : b),
    "",
  )

  return values.map((value) => {
    const voidCount = longestValue.length - value.length
    const voidText = voidValue.repeat(Math.max(voidCount, 0))

    return type === "before" ? `${voidText}${value}` : `${value}${voidText}`
  })
}

export const stringToIntHash = (value: string, min = 0, max = 500) => {
  const charAtSum = [...value].reduce(
    (sum, char) => sum + (char.codePointAt(0) ?? 0),
    0,
  )

  return (charAtSum % (max - min)) + min
}
