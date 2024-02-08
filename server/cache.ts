import { AppCache, CacheKey } from "./types/cache"

export default class CacheManager {
  #cache: AppCache = {
    nsfwPosts: [],
  }

  constructor() {}

  get<K extends CacheKey>(key: K): AppCache[K] {
    return this.#cache[key]
  }

  set<K extends CacheKey>(key: K, value: AppCache[K]) {
    this.#cache[key] = value
  }
}
