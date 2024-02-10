import { Events } from "discord.js"
import { createEvent } from "../utils/event"
import { discordIds } from "../config"
import CreditsModel from "../models/Credits"
import { UPPER_CLASS_MESSAGE_CREDITS } from "../constants"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (message) => {
    console.log("UPPER CLASS EVENT")

    if (message.channel.id !== discordIds.channels.upperClass) return
    if (message.author.bot) return
    if (!message.member) return

    if (!message.member.roles.cache.has(discordIds.roles.upperClass)) {
      await message.delete()
      return
    }

    const creditsModel = new CreditsModel(message.member)
    const wallet = await creditsModel.getWallet()

    // Role should account for this but just in case...
    const total = wallet.credits + wallet.banked
    if (total < UPPER_CLASS_MESSAGE_CREDITS) {
      await message.delete()
      return
    }

    // Allocate to take from banked first, then from credits
    let removeFromCredits = BigInt(0)
    let removeFromBanked = BigInt(UPPER_CLASS_MESSAGE_CREDITS)
    if (wallet.banked < removeFromBanked) {
      removeFromCredits = removeFromBanked - wallet.banked
      removeFromBanked = wallet.banked
    }

    await creditsModel.addCredits(-removeFromCredits, -removeFromBanked)
  },
)
