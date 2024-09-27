import { ReminderModel } from "../models/Reminder"
import { isTextChannel } from "../utils/channel"
import { CronTask } from "../utils/cron"
import { d } from "../utils/date"

export default {
  description: "Reminders",

  expression: "every minute",

  productionOnly: true,

  async execute(context) {
    const model = new ReminderModel()
    const reminders = await model.getAllExpired()
    if (!reminders.length) return

    await Promise.all(
      reminders.map(async (reminder) => {
        const channel = context.guild().channels.cache.get(reminder.channelId)
        if (!isTextChannel(channel)) return

        const message = await channel.messages.fetch(reminder.messageId)
        if (!message) return

        const fromNow = d(reminder.createdAt).fromNow()
        message.reply(
          `<@${reminder.userId}> here's a reminder you set ${fromNow}`,
        )
      }),
    )

    await Promise.all(reminders.map((reminder) => reminder.remove()))
  },
} as CronTask
