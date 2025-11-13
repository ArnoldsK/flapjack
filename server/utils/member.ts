import { APIEmbedAuthor, Guild, GuildMember } from "discord.js"

import { collectionToArray } from "~/server/utils/array"
import { d } from "~/server/utils/date"

export const getMemberByJoinPosition = async (
  guild: Guild,
  position: number,
): Promise<GuildMember | null> => {
  if (position <= 0) {
    return null
  }

  const sortedMembers = collectionToArray(
    guild.members.cache.sort((a, b) => a.joinedTimestamp! - b.joinedTimestamp!),
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

  for (const [i, sortedMember] of sortedMembers.entries()) {
    if (sortedMember.id === member.id) {
      return i + 1
    }
  }

  return -1
}

export const getMemberInfo = async (member: GuildMember) => {
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
    joinedAgo: d(member.joinedAt).fromNow(),
    joinedDate,
    createdDate,
  }
}

export const isTimedOut = (member: GuildMember) =>
  !!member.communicationDisabledUntil &&
  d(member.communicationDisabledUntil).isSameOrAfter(d())

export const embedAuthor = (member: GuildMember): APIEmbedAuthor => {
  return {
    name: member.displayName,
    icon_url: member.displayAvatarURL({
      extension: "png",
      forceStatic: true,
      size: 32,
    }),
  }
}
