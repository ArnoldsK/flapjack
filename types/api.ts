import { ChannelType } from "discord.js"

import { VideoEntity } from "~/server/db/entity/Video"
import { WeekRecapData } from "~/types/recap"

export interface ApiStatsDay {
  dateString: string
  messageCount: number
  topUsers: Array<{
    id: string
    displayName: string
    messageCount: number
  }>
  topChannels: Array<{
    id: string
    name: string
    type: ChannelType
    messageCount: number
  }>
}

export interface ApiStatsCommand {
  name: string
  count: number
}

export interface ApiStats {
  messagesPerDay: ApiStatsDay[]
  commands: ApiStatsCommand[]
}

export interface ApiAvatars {
  urls: string[]
}

export type ApiVideos = VideoEntity[]

export interface ApiRecapMember {
  memberId: string
  avatarUrl: string | null
  displayColor: string
}

export interface ApiRecap {
  recap: WeekRecapData
  members: ApiRecapMember[]
}
