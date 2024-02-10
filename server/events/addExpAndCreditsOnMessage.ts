import { Events } from "discord.js"
import { createEvent } from "../utils/event"
import ExperienceModel from "../models/Experience"
import CreditsModel from "../models/Credits"
import { MIN_CREDITS_PER_MESSAGE } from "../constants"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: false },
  async (message) => {
    console.log("CREDITS EVENT")

    if (message.author.bot) return
    if (!message.member) return

    // #############################################################################
    // Experience
    // #############################################################################
    const expModel = new ExperienceModel(message.member)
    await expModel.addExp()

    // #############################################################################
    // Credits
    // #############################################################################
    const creditsModel = new CreditsModel(message.member)
    const wallet = await creditsModel.getWallet()

    const secondsSinceUpdate = (Date.now() - wallet.updatedAt.getTime()) / 1000
    const timeBasedAmount = Math.floor(secondsSinceUpdate * 0.2)

    await creditsModel.addCredits(
      0,
      Math.max(MIN_CREDITS_PER_MESSAGE, timeBasedAmount),
    )
  },
)
