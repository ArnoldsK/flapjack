import { Collection } from "discord.js"

export const dedupe = <T>(array: T[]): T[] => {
  return [...new Set(array)]
}

export const collectionToArray = <K>(
  collection: Collection<unknown, K>,
): K[] => [...collection.values()]

export const sortBigInt = (a: bigint, b: bigint): number => {
  if (a > b) {
    return 1
  } else if (a < b) {
    return -1
  } else {
    return 0
  }
}
