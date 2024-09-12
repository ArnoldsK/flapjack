export interface RedGifsResponse {
  page: number
  pages: number
  total: number
  gifs: RedGifsGif[]
  feed_id: any
  cursor: any
}

export interface RedGifsGif {
  avgColor: string
  createDate: number
  description: string
  duration: number
  gallery: any
  hasAudio: boolean
  height: number
  hideHome: boolean
  hideTrending: boolean
  hls: boolean
  id: string
  likes: number
  niches: string[]
  published: boolean
  tags: string[]
  type: number
  urls: RedGifsUrls
  userName: string
  verified: boolean
  views: number
  width: number
  sexuality: string[]
}

export interface RedGifsUrls {
  sd: string
  hd: string
  poster: string
  thumbnail: string
  vthumbnail: string
}
