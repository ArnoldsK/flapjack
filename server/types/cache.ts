import { CacheObjectManager } from "../cache"
import { Settings } from "../constants/setting"
import { McStatus } from "./mc"
import { RedGifsGif } from "./redgifs"

export enum CacheKey {
  NsfwPosts = "nsfwPosts",
  Blackjack = "blackjack",
  McStatus = "mcStatus",
  Setting = "setting",
}

export interface AppCache {
  [CacheKey.NsfwPosts]: RedGifsGif[]
  [CacheKey.Blackjack]: CacheObjectManager<string>
  [CacheKey.McStatus]: McStatus | null
  [CacheKey.Setting]: Settings | null
}
