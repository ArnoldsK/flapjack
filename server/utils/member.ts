import { Guild, GuildMember } from "discord.js"
import moment from "moment"
import { collectionToArray } from "./array"
import { formatDays } from "./date"

export const getMemberByJoinPosition = async (
  guild: Guild,
  position: number,
): Promise<GuildMember | null> => {
  if (position <= 0) {
    return null
  }

  const members = await guild.members.fetch()
  const sortedMembers = collectionToArray(
    members.sort((a, b) => a.joinedTimestamp! - b.joinedTimestamp!),
  )

  if (position > sortedMembers.length) {
    return null
  }

  return sortedMembers[position - 1] ?? null
}

export const getMemberJoinPosition = async (
  member: GuildMember,
): Promise<number> => {
  const members = await member.guild.members.fetch()
  const sortedMembers = collectionToArray(
    members.sort((a, b) => a.joinedTimestamp! - b.joinedTimestamp!),
  )

  for (let i = 0; i < sortedMembers.length; i++) {
    if (sortedMembers[i].id === member.id) {
      return i + 1
    }
  }

  return -1
}

export const getMemberInfo = async (member: GuildMember) => {
  const daysSinceJoined = moment().diff(moment(member.joinedAt), "days")
  const joinedDate = new Date(member.joinedTimestamp!).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )
  const createdDate = new Date(member.user.createdTimestamp).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )

  return {
    position: await getMemberJoinPosition(member),
    joinedAgo: formatDays(-daysSinceJoined),
    joinedDate,
    createdDate,
  }
}
