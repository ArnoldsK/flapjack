import { Events } from "discord.js"

import { createEvent } from "../utils/event"
import { TimeoutModel } from "../models/Timeout"
import { embedAuthor, isTimedOut } from "../utils/member"
import { d } from "../utils/date"
import { sendLogMessage } from "../utils/message"
import { Color } from "../constants"

export default createEvent(
  Events.GuildMemberUpdate,
  {
    productionOnly: true,
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
            author: embedAuthor(newMember),
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

      const penaltyText = penaltyMs
        ? `Added ${d().add(penaltyMs).fromNow(true)} penalty`
        : ""

      if (penaltyMs) {
        timeoutUntil = d(timeoutUntil).add(penaltyMs).toDate()

        // ! As long as `oldIsTimedOut === newIsTimedOut` exists, this won't loop
        await newMember.disableCommunicationUntil(timeoutUntil, penaltyText)
      }

      await sendLogMessage(context, {
        embeds: [
          {
            color: Color.orange,
            author: embedAuthor(newMember),
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
