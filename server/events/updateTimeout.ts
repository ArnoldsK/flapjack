import { Events } from "discord.js"

import { createEvent } from "../utils/event"
import { TimeoutModel } from "../models/Timeout"
import { getEmbedAuthor, isTimedOut } from "../utils/member"
import { d } from "../utils/date"
import { sendLogMessage } from "../utils/message"
import { Color } from "../constants"
import { asPlural } from "../utils/string"

export default createEvent(
  Events.GuildMemberUpdate,
  {
    productionOnly: false,
  },
  async (context, oldMember, newMember) => {
    if (newMember.user.bot) return
    if (oldMember.partial || newMember.partial) return

    const oldIsTimedOut = isTimedOut(oldMember)
    const newIsTimedOut = isTimedOut(newMember)

    // No change
    if (oldIsTimedOut === newIsTimedOut) return

    const model = new TimeoutModel(newMember)

    if (oldIsTimedOut && !newIsTimedOut) {
      await sendLogMessage(context, {
        embeds: [
          {
            color: Color.blue,
            author: getEmbedAuthor(newMember),
            title: "Timeout removed",
          },
        ],
      })

      await model.remove()
    } else if (!oldIsTimedOut && newIsTimedOut) {
      let timeoutUntil = newMember.communicationDisabledUntil!

      const entity = await model.get()
      const msSincePrevious = entity ? d().diff(entity.until) : 0
      const penaltyMs = Math.max(0, (entity?.durationMs ?? 0) - msSincePrevious)

      const penaltyMinutes = Math.floor(penaltyMs / 1000 / 60)
      const penaltyText = penaltyMinutes
        ? `Added ${asPlural(penaltyMinutes, "minute", "$1 $2")} penalty`
        : ""

      if (penaltyMs) {
        timeoutUntil = d(timeoutUntil).add(penaltyMs).toDate()

        // Apparently I can just set it and it won't trigger the event again
        await newMember.disableCommunicationUntil(timeoutUntil, penaltyText)
      }

      await sendLogMessage(context, {
        embeds: [
          {
            color: Color.orange,
            author: getEmbedAuthor(newMember),
            title: "Timeout added",
            description: `Expires <t:${Math.round(
              timeoutUntil.getTime() / 1000,
            )}:R>`,
            footer: penaltyText
              ? {
                  text: penaltyText,
                }
              : undefined,
          },
        ],
      })
      await model.set({
        until: timeoutUntil,
        durationMs: d(timeoutUntil).diff(d()),
      })
    }
  },
)
