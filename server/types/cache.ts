export interface CacheNsfwPost {
  title: string
  url: string
  mediaUrl: string
}

export enum CacheKey {
  NsfwPosts = "nsfwPosts",
}

export interface AppCache {
  [CacheKey.NsfwPosts]: CacheNsfwPost[]
}
