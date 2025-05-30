import { SlashCommandBuilder } from "discord.js"

import { DISCORD_IDS, Unicode } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { d } from "~/server/utils/date"
import { checkUnreachable } from "~/server/utils/error"
import { isTimedOut } from "~/server/utils/member"
import {
  getTimeoutAddedEmbed,
  getTimeoutRemovedEmbed,
} from "~/server/utils/message"
import {
  memberHasPermission,
  permission,
  PermissionFlags,
} from "~/server/utils/permission"

enum SubcommandName {
  List = "list",
  Add = "add",
  Remove = "remove",
}

enum OptionName {
  User = "user",
  DurationType = "duration",
  DurationValue = "amount",
}

enum DurationType {
  Minutes = "minutes",
  Hours = "hours",
  Days = "days",
}

export default class MuteCommand extends BaseCommand {
  static version = 3

  static command = new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Manage user timeouts")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.List)
        .setDescription("List all active timeouts"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Add)
        .setDescription("Add user timeout (Admin)")
        .addUserOption((option) =>
          option
            .setName(OptionName.User)
            .setDescription("The user to timeout")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName(OptionName.DurationType)
            .setDescription("Timeout duration type")
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
            .setDescription("Timeout duration value")
            .setMinValue(1)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Remove)
        .setDescription("Remove user timeout (Admin)")
        .addUserOption((option) =>
          option
            .setName(OptionName.User)
            .setDescription("The user to remove timeout from")
            .setRequired(true),
        ),
    )

  static permissions = permission({
    type: "either",
    permissions: [
      PermissionFlags.ModerateMembers,
      PermissionFlags.NitroBooster,
    ],
  })

  #canModerate() {
    return memberHasPermission(this.member, {
      type: "allow",
      permissions: [PermissionFlags.ModerateMembers],
    })
  }

  async execute() {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.List: {
        await this.#handleList()
        break
      }

      case SubcommandName.Add: {
        if (!this.#canModerate()) {
          this.deny()
          return
        }
        await this.#handleAdd()
        break
      }

      case SubcommandName.Remove: {
        if (!this.#canModerate()) {
          this.deny()
          return
        }
        await this.#handleRemove()
        break
      }

      default: {
        checkUnreachable(subcommand)
      }
    }
  }

  async #handleList() {
    const timedOutMembers = this.guild.members.cache.filter(isTimedOut)

    this.reply({
      ephemeral: true,
      content: timedOutMembers.size === 0 ? "No one is timed out" : undefined,
      embeds: timedOutMembers.size > 0
        ? [
            {
              description: timedOutMembers
                .sort(
                  (a, b) =>
                    a.communicationDisabledUntilTimestamp! -
                    b.communicationDisabledUntilTimestamp!,
                )
                .map(({ displayName, communicationDisabledUntil }) => {
                  return `**${displayName}** ${Unicode.longDash} expires ${d(
                    communicationDisabledUntil,
                  ).fromNow()}`
                })
                .join("\n"),
            },
          ]
        : undefined,
    })
  }

  async #handleAdd() {
    // Parse input member
    const user = this.interaction.options.getUser(OptionName.User, true)
    const member = this.guild.members.cache.get(user.id)

    if (!member) {
      this.fail("User not found")
      return
    }

    if (isTimedOut(member)) {
      this.fail("User is already timed out")
      return
    }

    // Parse input date
    const durationType = this.interaction.options.getString(
      OptionName.DurationType,
      true,
    ) as DurationType
    const durationValue = this.interaction.options.getInteger(
      OptionName.DurationValue,
      true,
    )

    // Add timeout
    const timeoutUntil = d().add(durationValue, durationType).toDate()
    await member.disableCommunicationUntil(timeoutUntil)

    this.reply({
      ephemeral: true,
      embeds: [
        {
          ...getTimeoutAddedEmbed({ member, timeoutUntil }),
          description: `See <#${DISCORD_IDS.channels.logs}> for details`,
        },
      ],
    })
  }

  async #handleRemove() {
    // Parse input member
    const user = this.interaction.options.getUser(OptionName.User, true)
    const member = this.guild.members.cache.get(user.id)

    if (!member) {
      this.fail("User not found")
      return
    }

    if (!isTimedOut(member)) {
      this.fail("User is not timed out")
      return
    }

    // Remove timeout
    await member.disableCommunicationUntil(null)

    this.reply({
      ephemeral: true,
      embeds: [getTimeoutRemovedEmbed({ member })],
    })
  }
}
