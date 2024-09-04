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
