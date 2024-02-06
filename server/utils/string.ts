export const joinAsLines = (...values: string[]) => values.join("\n")

export const ucFirst = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
