import { Game } from "engine-blackjack-ts"

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
  [CacheKey.Blackjack]: Game | null
}
