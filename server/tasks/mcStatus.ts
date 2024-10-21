import { z } from "zod"
import { discordIds } from "../config"
import { Task } from "../types/tasks"
import { isTextChannel } from "../utils/channel"
import { CacheKey } from "../types/cache"
import { McStatus } from "../types/mc"
import { joinAsLines } from "../utils/string"
import { isNonNullish } from "../utils/boolean"
import { Color } from "../constants"

const SERVER_IP = "mc.pepsidog.lv"

export const mcStatus: Task = async (context) => {
  const channel = context
    .guild()
    .channels.cache.get(discordIds.channels.minecraft)
  if (!isTextChannel(channel)) return

  // #############################################################################
  // Get status
  // #############################################################################
  const apiUrl = new URL("/server/status", "https://mcapi.us")
  apiUrl.searchParams.set("ip", SERVER_IP)

  const res = await fetch(apiUrl)
  const data = z
    .object({
      online: z.boolean(),
      players: z.object({
        now: z.number(),
        max: z.number(),
        sample: z.array(
          z.object({
            name: z.string(),
            id: z.string(),
          }),
        ),
      }),
    })
    .parse(await res.json())

  const status: McStatus = {
    isOnline: data.online,
    playerNames: data.players.sample
      .flatMap((player) => player.name)
      .sort((a, b) => a.localeCompare(b)),
  }
  const prevStatus = context.cache.get(CacheKey.McStatus)

  // #############################################################################
  // Update topic
  // #############################################################################
  const topicLines = (channel.topic ?? "").split("\n")

  if (topicLines[0]?.startsWith(SERVER_IP)) {
    const statusString = status.isOnline
      ? `${data.players.now}/${data.players.max}`
      : "off"

    await channel.setTopic(
      joinAsLines(`${SERVER_IP} (${statusString})`, ...topicLines.slice(1)),
    )
  }

  // #############################################################################
  // Alert status change
  // #############################################################################
  if (prevStatus != null && status.isOnline !== prevStatus.isOnline) {
    await channel.send({
      embeds: [
        {
          title: SERVER_IP,
          description: `Server is ${status.isOnline ? "online" : "offline"}`,
          color: status.isOnline ? Color.green : Color.red,
        },
      ],
    })
  }

  // #############################################################################
  // Player join and left
  // #############################################################################
  if (prevStatus != null && status.isOnline) {
    const joinedNames = status.playerNames.filter(
      (name) => !prevStatus.playerNames.includes(name),
    )
    const leftNames = prevStatus.playerNames.filter(
      (name) => !status.playerNames.includes(name),
    )

    const descriptionLines = [
      joinedNames.length ? `${joinedNames.join(", ")} joined` : null,
      leftNames.length ? `${leftNames.join(", ")} left` : null,
    ].filter(isNonNullish)

    if (descriptionLines.length) {
      await channel.send({
        embeds: [
          {
            description: descriptionLines.join("\n"),
          },
        ],
      })
    }
  }

  // #############################################################################
  // Update cache
  // #############################################################################
  context.cache.set(CacheKey.McStatus, status)
}
