import { Game } from "engine-blackjack-ts"
import { AppCache, CacheKey } from "./types/cache"

export default class CacheManager {
  #cache: AppCache = {
    [CacheKey.NsfwPosts]: [],
    [CacheKey.Blackjack]: null,
  }

  constructor() {}

  get<K extends CacheKey>(key: K): AppCache[K] {
    return this.#cache[key]
  }

  set<K extends CacheKey>(key: K, value: AppCache[K]) {
    this.#cache[key] = value
  }
}
