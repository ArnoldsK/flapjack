import { Events } from "discord.js"
import { createEvent } from "../utils/event"
import { ExperienceModel } from "../db/model/Experience"
import { CreditsModel } from "../db/model/Credits"
import {
  EXP_PER_MESSAGE,
  MIN_CREDITS_PER_MESSAGE,
  RANK_ACTIVE_ROLE_LEVEL,
} from "../../constants"
import { DISCORD_IDS } from "../../constants"
import { getExperienceLevelData } from "../utils/experience"
import { isTextChannel } from "../utils/channel"
import { embedAuthor } from "../utils/member"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (_context, message) => {
    if (message.author.bot) return
    if (!message.member) return

    // #############################################################################
    // Experience
    // #############################################################################
    const expModel = new ExperienceModel(message.member)
    const exp = await expModel.getExp()

    // Add exp
    await expModel.addExp()

    // Parse exp change
    const { lvl } = getExperienceLevelData(exp)
    const { lvl: lvlNew } = getExperienceLevelData(exp + EXP_PER_MESSAGE)

    // Active role
    const activeRole = message.guild?.roles.cache.get(
      DISCORD_IDS.roles.activeMember,
    )

    if (lvlNew >= RANK_ACTIVE_ROLE_LEVEL && activeRole) {
      if (!message.member.roles.cache.get(activeRole.id)) {
        message.member.roles.add(activeRole)
      }
    }

    // Level-up
    if (lvlNew > lvl && lvlNew >= RANK_ACTIVE_ROLE_LEVEL) {
      const channel = message.guild?.channels.cache.get(
        DISCORD_IDS.channels.bepsi,
      )

      if (isTextChannel(channel)) {
        channel.send({
          embeds: [
            {
              author: embedAuthor(message.member),
              title: "Level Up!",
              description: `LVL ${lvlNew}`,
              color: message.member.displayColor,
            },
          ],
        })
      }
    }

    // #############################################################################
    // Credits
    // #############################################################################
    const creditsModel = new CreditsModel(message.member)
    const wallet = await creditsModel.getWallet()

    const secondsSinceUpdate = (Date.now() - wallet.updatedAt.getTime()) / 1000
    const timeBasedAmount = Math.floor(secondsSinceUpdate * 0.2)

    await creditsModel.addCredits(
      Math.max(MIN_CREDITS_PER_MESSAGE, timeBasedAmount),
    )
  },
)
