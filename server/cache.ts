import { Settings } from "~/server/db/model/Setting"
import { ApiStats, ApiVideos } from "~/types/api"
import { McStatus } from "~/types/mc"
import { RedGifsGif } from "~/types/redgifs"

export enum CacheKey {
  NsfwPosts = "nsfwPosts",
  Blackjack = "blackjack",
  McStatus = "mcStatus",
  Setting = "setting",
  Videos = "videos",
  Stats = "stats",
  DeleteUserMessagesRunning = "deleteUserMessagesRunning",
  UserGearImage = "userGearImage",
}

interface AppCache {
  [CacheKey.NsfwPosts]: RedGifsGif[]
  [CacheKey.Blackjack]: CacheObjectManager<string>
  [CacheKey.McStatus]: McStatus | null
  [CacheKey.Setting]: Settings | null
  [CacheKey.Videos]: ApiVideos | null
  [CacheKey.Stats]: ApiStats | null
  [CacheKey.DeleteUserMessagesRunning]: boolean
  [CacheKey.UserGearImage]: CacheObjectManager<Buffer>
}

export default class CacheManager {
  #cache: AppCache = {
    [CacheKey.NsfwPosts]: [],
    [CacheKey.Blackjack]: new CacheObjectManager(),
    [CacheKey.McStatus]: null,
    [CacheKey.Setting]: null,
    [CacheKey.Videos]: null,
    [CacheKey.Stats]: null,
    [CacheKey.DeleteUserMessagesRunning]: false,
    [CacheKey.UserGearImage]: new CacheObjectManager(),
  }

  constructor() {}

  get<K extends CacheKey>(key: K): AppCache[K] {
    return this.#cache[key]
  }

  set<K extends CacheKey>(key: K, value: AppCache[K]) {
    this.#cache[key] = value
  }
}

export class CacheObjectManager<T> {
  #obj: Record<string, T> = {}

  constructor(initial?: Record<string, T>) {
    if (initial) {
      this.#obj = initial
    }
  }

  raw(): Record<string, T> {
    return this.#obj
  }

  get(key: string): T | undefined {
    return this.#obj[key]
  }

  has(key: string): boolean {
    return this.get(key) === undefined
  }

  set(key: string, value: T) {
    this.#obj[key] = value
  }

  uns(key: string) {
    delete this.#obj[key]
  }
}
