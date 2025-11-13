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

export const isGoodScarabPrice = (chaosValue: number): boolean => {
  return chaosValue >= 2
}

export const isBadScarabPrice = (chaosValue: number): boolean => {
  return chaosValue < 0.5
}

export const formatScarabPrice = (chaosValue: number): string => {
  // 1. Handle values >= 1 (Return the integer part)
  if (chaosValue >= 1) {
    return `${Math.floor(chaosValue)}c`
  }

  // 2. Handle values < 1 (Convert to a simplified fraction)

  // a. GCD helper function (Euclidean Algorithm)
  const gcd = (a: number, b: number): number => {
    return b ? gcd(b, a % b) : a
  }

  // b. Find a suitable denominator and numerator
  // We multiply by a power of 10 until the value is an integer (e.g., for 0.75, we multiply by 100 to get 75).
  // The max power of 10 (e.g., 1,000,000) limits the precision.
  const precision = 10
  const numerator = Math.round(chaosValue * precision)
  const denominator = precision

  // c. Simplify the fraction using GCD
  const commonDivisor = gcd(numerator, denominator)
  const simpleNumerator = numerator / commonDivisor
  const simpleDenominator = denominator / commonDivisor

  // d. Return the simplified fraction string
  return `${simpleNumerator}c/${simpleDenominator}`
}
