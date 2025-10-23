import { Events } from "discord.js"

import { DISCORD_IDS } from "~/constants"
import { UPPER_CLASS_MESSAGE_CREDITS } from "~/constants"
import { CreditsModel } from "~/server/db/model/Credits"
import { createEvent } from "~/server/utils/event"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (context, message) => {
    if (message.channel.id !== DISCORD_IDS.channels.upperClass) return
    if (message.author.bot) return
    if (!message.member) return

    if (!message.member.roles.cache.has(DISCORD_IDS.roles.upperClass)) {
      await message.delete()
      return
    }

    const creditsModel = new CreditsModel(context)
    const wallet = await creditsModel.getWallet(message.member.id)

    // Role should account for this but just in case...
    if (wallet.credits < UPPER_CLASS_MESSAGE_CREDITS) {
      await message.delete()
      return
    }

    const removeFromCredits = BigInt(UPPER_CLASS_MESSAGE_CREDITS)
    await creditsModel.modifyCredits({
      userId: message.member.id,
      byAmount: -removeFromCredits,
      isCasino: false,
    })
  },
)
