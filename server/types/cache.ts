import { CacheObjectManager } from "../cache"
import { McStatus } from "./mc"
import { RedGifsGif } from "./redgifs"

export enum CacheKey {
  NsfwPosts = "nsfwPosts",
  Blackjack = "blackjack",
  McStatus = "mcStatus",
}

export interface AppCache {
  [CacheKey.NsfwPosts]: RedGifsGif[]
  [CacheKey.Blackjack]: CacheObjectManager<string>
  [CacheKey.McStatus]: McStatus | null
}
