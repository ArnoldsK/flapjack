import { SlashCommandBuilder } from "discord.js"

import { BaseCommand } from "~/server/base/Command"
import { ReminderModel } from "~/server/db/model/Reminder"
import { d } from "~/server/utils/date"
import { assert } from "~/server/utils/error"
import { embedAuthor } from "~/server/utils/member"
import { contentRelativeTime, parseMentions } from "~/server/utils/message"
import { joinAsLines } from "~/server/utils/string"

enum OptionName {
  DurationType = "duration",
  DurationValue = "amount",
  Reminder = "reminder",
}

enum DurationType {
  Minutes = "minutes",
  Hours = "hours",
  Days = "days",
  Weeks = "weeks",
  Months = "months",
  Years = "years",
}

export default class RemindCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Create a reminder")
    .addStringOption((option) =>
      option
        .setName(OptionName.DurationType)
        .setDescription("Reminder duration type")
        .setChoices(
          ...Object.entries(DurationType).map(([name, value]) => ({
            name,
            value,
          })),
        )
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName(OptionName.DurationValue)
        .setDescription("Reminder duration value")
        .setMinValue(1)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName(OptionName.Reminder)
        .setDescription("Message in a bottle")
        .setRequired(true),
    )

  async execute() {
    const durationType = this.interaction.options.getString(
      OptionName.DurationType,
      true,
    ) as DurationType
    const durationValue = this.interaction.options.getInteger(
      OptionName.DurationValue,
      true,
    )
    const reminder = this.interaction.options.getString(
      OptionName.Reminder,
      true,
    )

    // Parse expiry date
    const dExpiresAt = d().add(durationValue, durationType)
    assert(dExpiresAt.isValid(), "Unable to create the reminder date")
    const expiresAt = dExpiresAt.toDate()

    // Parse reminder value
    const value = parseMentions(reminder, this.guild)

    // Send the reminder message
    // This will be replied to when the reminder expires
    const reply = await this.reply({
      embeds: [
        {
          author: embedAuthor(this.member),
          title: "Reminder",
          description: joinAsLines(
            contentRelativeTime(expiresAt.getTime()),
            "",
            value,
          ),
        },
      ],
    })
    assert(!!reply, "Unable to create a reminder")

    const message = await reply.fetch()

    // Create the entity
    const model = new ReminderModel(this.context)
    await model.create({
      channelId: this.channel.id,
      messageId: message.id,
      userId: this.member.id,
      expiresAt: expiresAt,
      value,
    })
  }
}
