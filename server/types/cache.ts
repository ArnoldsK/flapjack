import { CacheObjectManager } from "../cache"
import { RedGifsGif } from "./redgifs"

export enum CacheKey {
  NsfwPosts = "nsfwPosts",
  Blackjack = "blackjack",
}

export interface AppCache {
  [CacheKey.NsfwPosts]: RedGifsGif[]
  [CacheKey.Blackjack]: CacheObjectManager<string>
}
