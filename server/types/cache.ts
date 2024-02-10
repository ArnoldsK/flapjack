import { CacheObjectManager } from "../cache"

export interface CacheNsfwPost {
  title: string
  url: string
  mediaUrl: string
}

export enum CacheKey {
  NsfwPosts = "nsfwPosts",
  Blackjack = "blackjack",
}

export interface AppCache {
  [CacheKey.NsfwPosts]: CacheNsfwPost[]
  [CacheKey.Blackjack]: CacheObjectManager<string>
}
