import { VideoEntity } from "./db/entity/Video"
import { EntityFields } from "./types/entity"
import { McStatus } from "./types/mc"
import { RedGifsGif } from "./types/redgifs"
import { Settings } from "./constants/setting"
import { ApiStatsCommand } from "./types/api"

export enum CacheKey {
  NsfwPosts = "nsfwPosts",
  Blackjack = "blackjack",
  McStatus = "mcStatus",
  Setting = "setting",
  Videos = "videos",
  StatsCommands = "statsCommands",
}

interface AppCache {
  [CacheKey.NsfwPosts]: RedGifsGif[]
  [CacheKey.Blackjack]: CacheObjectManager<string>
  [CacheKey.McStatus]: McStatus | null
  [CacheKey.Setting]: Settings | null
  [CacheKey.Videos]: EntityFields<VideoEntity>[] | null
  [CacheKey.StatsCommands]: ApiStatsCommand[] | null
}

export default class CacheManager {
  #cache: AppCache = {
    [CacheKey.NsfwPosts]: [],
    [CacheKey.Blackjack]: new CacheObjectManager(),
    [CacheKey.McStatus]: null,
    [CacheKey.Setting]: null,
    [CacheKey.Videos]: null,
    [CacheKey.StatsCommands]: null,
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
