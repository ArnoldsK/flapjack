import { Collection } from "discord.js"

export const dedupe = <T>(array: T[]): T[] => {
  return [...new Set(array)]
}

export const collectionToArray = <K>(
  collection: Collection<unknown, K>,
): K[] => [...collection.values()]
