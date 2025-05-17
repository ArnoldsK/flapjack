export interface WeekRecapData {
  createdAt: Date
  messages: Array<{
    id: string
    createdAt: Date
    content: string
    firstAttachment: {
      id: string
      isImage: boolean
      isVideo: boolean
      url: string
    } | null
    guild: {
      id: string
    }
    channel: {
      id: string
      name: string
    }
    member: {
      id: string
      displayName: string | null
      username: string
    }
    reactions: Array<{
      emoji: {
        identifier: string
        id: string | null
        name: string | null
        url: string | null
      }
      count: number
    }>
    reactionCount: number
  }>
}
