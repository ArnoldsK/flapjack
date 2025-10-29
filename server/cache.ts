import { Settings } from "~/server/db/model/Setting"
import { ApiStats, ApiVideos } from "~/types/api"
import { McStatus } from "~/types/mc"
import { RedGifsGif } from "~/types/redgifs"

export enum CacheKey {
  NsfwPosts = "nsfwPosts",
  GamesRunning = "gamesRunning",
  McStatus = "mcStatus",
  Setting = "setting",
  Videos = "videos",
  Stats = "stats",
  DeleteUserMessagesRunning = "deleteUserMessagesRunning",
}

interface AppCache {
  [CacheKey.NsfwPosts]: RedGifsGif[]
  [CacheKey.GamesRunning]: CacheObjectManager<
    "blackjack" | "jacksbetter",
    boolean
  >
  [CacheKey.McStatus]: McStatus | null
  [CacheKey.Setting]: Settings | null
  [CacheKey.Videos]: ApiVideos | null
  [CacheKey.Stats]: ApiStats | null
  [CacheKey.DeleteUserMessagesRunning]: boolean
}

export default class CacheManager {
  #cache: AppCache = {
    [CacheKey.NsfwPosts]: [],
    [CacheKey.GamesRunning]: new CacheObjectManager(),
    [CacheKey.McStatus]: null,
    [CacheKey.Setting]: null,
    [CacheKey.Videos]: null,
    [CacheKey.Stats]: null,
    [CacheKey.DeleteUserMessagesRunning]: false,
  }

  constructor() {}

  get<K extends CacheKey>(key: K): AppCache[K] {
    return this.#cache[key]
  }

  set<K extends CacheKey>(key: K, value: AppCache[K]) {
    this.#cache[key] = value
  }
}

export class CacheObjectManager<K extends string, T> {
  #obj: Record<K, T> = {} as Record<K, T>

  constructor(initial?: Record<K, T>) {
    if (initial) {
      this.#obj = initial
    }
  }

  raw(): Record<string, T> {
    return this.#obj
  }

  get(key: K): T | undefined {
    return this.#obj[key]
  }

  has(key: K): boolean {
    return this.get(key) === undefined
  }

  set(key: K, value: T) {
    this.#obj[key] = value
  }

  uns(key: K) {
    delete this.#obj[key]
  }
}
