import { GuildMember } from "discord.js"

export interface RankLevelData {
  exp: number
  lvl: number
  min: number
  max: number
  percent: number
}

export interface MemberRankData {
  member: GuildMember
  rank: number
  levelData: RankLevelData
}
