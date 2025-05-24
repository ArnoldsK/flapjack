import { Events } from "discord.js"

import { MIN_CREDITS_PER_MESSAGE, RANK_ACTIVE_ROLE_LEVEL } from "~/constants"
import { DISCORD_IDS } from "~/constants"
import { appConfig } from "~/server/config"
import { CreditsModel } from "~/server/db/model/Credits"
import { ExperienceModel } from "~/server/db/model/Experience"
import { isTextChannel } from "~/server/utils/channel"
import { createEvent } from "~/server/utils/event"
import { getExperienceLevelData } from "~/server/utils/experience"
import { embedAuthor } from "~/server/utils/member"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: false },
  async (context, message) => {
    if (message.author.bot) return
    if (!message.member) return

    // #############################################################################
    // Experience
    // #############################################################################
    const expModel = new ExperienceModel(context)
    const { oldExp, newExp } = await expModel.addExp(message.member.id)

    // Parse exp change
    const { lvl } = getExperienceLevelData(oldExp)
    const { lvl: newLvl } = getExperienceLevelData(newExp)

    // Active role
    const activeRole = message.guild?.roles.cache.get(
      DISCORD_IDS.roles.activeMember,
    )

    if (
      newLvl >= RANK_ACTIVE_ROLE_LEVEL &&
      activeRole &&
      !message.member.roles.cache.get(activeRole.id)
    ) {
      message.member.roles.add(activeRole)
    }

    // Level-up
    if (newLvl > lvl && newLvl >= RANK_ACTIVE_ROLE_LEVEL) {
      const channel = message.guild?.channels.cache.get(
        DISCORD_IDS.channels.bepsi,
      )

      if (!appConfig.dev && isTextChannel(channel)) {
        channel.send({
          embeds: [
            {
              author: embedAuthor(message.member),
              title: "Level Up!",
              description: `LVL ${newLvl}`,
              color: message.member.displayColor,
            },
          ],
        })
      }
    }

    // #############################################################################
    // Credits
    // #############################################################################
    const creditsModel = new CreditsModel(context)
    const wallet = await creditsModel.getWallet(message.member.id)

    const secondsSinceUpdate = (Date.now() - wallet.updatedAt.getTime()) / 1000
    const timeBasedAmount = Math.floor(secondsSinceUpdate * 0.2)

    await creditsModel.addCredits(
      message.member.id,
      Math.max(MIN_CREDITS_PER_MESSAGE, timeBasedAmount),
    )
  },
)
