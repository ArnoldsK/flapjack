import { McStatus } from "../types/mc"
import { RedGifsGif } from "../types/redgifs"
import { Settings } from "./db/model/Setting"
import { ApiStatsCommand, ApiStatsDay, ApiVideos } from "../types/api"
import { WeekRecapData } from "../types/recap"

export enum CacheKey {
  NsfwPosts = "nsfwPosts",
  Blackjack = "blackjack",
  McStatus = "mcStatus",
  Setting = "setting",
  Videos = "videos",
  StatsMessagesPerDay = "statsMessagesPerDay",
  StatsCommands = "statsCommands",
}

interface AppCache {
  [CacheKey.NsfwPosts]: RedGifsGif[]
  [CacheKey.Blackjack]: CacheObjectManager<string>
  [CacheKey.McStatus]: McStatus | null
  [CacheKey.Setting]: Settings | null
  [CacheKey.Videos]: ApiVideos | null
  [CacheKey.StatsMessagesPerDay]: ApiStatsDay[] | null
  [CacheKey.StatsCommands]: ApiStatsCommand[] | null
  [CacheKey.WeekRecap]: WeekRecapData | null
}

export default class CacheManager {
  #cache: AppCache = {
    [CacheKey.NsfwPosts]: [],
    [CacheKey.Blackjack]: new CacheObjectManager(),
    [CacheKey.McStatus]: null,
    [CacheKey.Setting]: null,
    [CacheKey.Videos]: null,
    [CacheKey.StatsMessagesPerDay]: null,
    [CacheKey.StatsCommands]: null,
    [CacheKey.WeekRecap]: null,
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
