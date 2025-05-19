import { ReminderModel } from "~/server/db/model/Reminder"
import { isTextChannel } from "~/server/utils/channel"
import { d } from "~/server/utils/date"
import { Task } from "~/types/tasks"

export const endReminders: Task = async (context) => {
  const model = new ReminderModel()
  const reminders = await model.getAllExpired()
  if (reminders.length === 0) return

  await Promise.all(
    reminders.map(async (reminder) => {
      const channel = context.guild().channels.cache.get(reminder.channelId)
      if (!isTextChannel(channel)) return

      try {
        const message = await channel.messages.fetch(reminder.messageId)
        if (!message) return

        const fromNow = d(reminder.createdAt).fromNow()
        message.reply(
          `<@${reminder.userId}> here's a reminder you set ${fromNow}`,
        )
      } catch {
        // Do nothing
      }
    }),
  )

  await Promise.all(reminders.map((reminder) => reminder.remove()))
}
