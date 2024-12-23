export const getEmojiIdFromString = (value: string): string | undefined => {
  const matches = value.match(/<a?:.*?:(\d+)>/)

  return matches?.[1]
}

/**
 * Attempt to extract a native emoji from text
 * It will, however, return all of them if there're multiple
 */
export const getNativeEmojiFromString = (value: string): string | undefined => {
  const matches = value.match(
    /(?:[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2600-\u27BF]|\u24C2|[\u2B50-\u2B55]|\u200D)+/u,
  )

  return matches?.[0]
}
