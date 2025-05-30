import { z } from "zod"

import { Color, DISCORD_IDS } from "~/constants"
import { CacheKey } from "~/server/cache"
import { isTextChannel } from "~/server/utils/channel"
import { joinAsLines } from "~/server/utils/string"
import { McStatus } from "~/types/mc"
import { Task } from "~/types/tasks"

const SERVER_IP = "mc.pepsidog.lv"

export const DATA_SCHEMA = z.object({
  online: z.boolean(),
  players: z.object({
    online: z.number(),
    max: z.number(),
    list: z
      .array(
        z.object({
          name: z.string(),
          uuid: z.string().uuid(),
        }),
      )
      .optional(),
  }),
})

export const mcStatus: Task = async (context) => {
  const channel = context
    .guild()
    .channels.cache.get(DISCORD_IDS.channels.minecraft)
  if (!isTextChannel(channel)) return

  // #############################################################################
  // Return early if no topic requirement
  // #############################################################################
  const topicLines = (channel.topic ?? "").split("\n")

  if (!topicLines[0]?.includes(SERVER_IP)) return

  // #############################################################################
  // Get status
  // #############################################################################
  const apiUrl = new URL(`https://api.mcsrvstat.us/3/${SERVER_IP}`)

  let data: z.TypeOf<typeof DATA_SCHEMA>
  try {
    const res = await fetch(apiUrl)
    data = DATA_SCHEMA.parse(await res.json())
  } catch {
    // Shrug
    return
  }

  const status: McStatus = {
    isOnline: data.online,
    playerNames: data.players.list?.flatMap((player) => player.name) ?? [],
  }
  const prevStatus = context.cache.get(CacheKey.McStatus)

  // #############################################################################
  // Update topic
  // #############################################################################
  const ipString = `[${SERVER_IP}](https://mcsrvstat.us/server/${SERVER_IP})`
  const statusString =
    status.isOnline && data.players
      ? `${data.players.online}/${data.players.max}`
      : "off"

  await channel.setTopic(
    joinAsLines(`${ipString} (${statusString})`, ...topicLines.slice(1)),
  )

  // #############################################################################
  // Alert status change
  // #############################################################################
  if (prevStatus != undefined && status.isOnline !== prevStatus.isOnline) {
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

  // // #############################################################################
  // // Player join and left
  // // #############################################################################
  // if (prevStatus != null && status.isOnline) {
  //   const joinedNames = status.playerNames.filter(
  //     (name) => !prevStatus.playerNames.includes(name),
  //   )
  //   const leftNames = prevStatus.playerNames.filter(
  //     (name) => !status.playerNames.includes(name),
  //   )

  //   const descriptionLines = [
  //     joinedNames.length ? `${joinedNames.join(", ")} joined` : null,
  //     leftNames.length ? `${leftNames.join(", ")} left` : null,
  //   ].filter(isNonNullish)

  //   if (descriptionLines.length) {
  //     await channel.send({
  //       embeds: [
  //         {
  //           description: descriptionLines.join("\n"),
  //         },
  //       ],
  //     })
  //   }
  // }

  // #############################################################################
  // Update cache
  // #############################################################################
  context.cache.set(CacheKey.McStatus, status)
}
