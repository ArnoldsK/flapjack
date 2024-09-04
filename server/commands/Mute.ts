import { SlashCommandBuilder } from "discord.js"

import { BaseCommand } from "../base/Command"
import { permission, PermissionFlags } from "../utils/permission"
import { checkUnreachable } from "../utils/error"
import { d } from "../utils/date"
import { Unicode } from "../constants"
import { isTimedOut } from "../utils/member"

enum SubcommandName {
  List = "list",
  // Add = "add",
  // Remove = "remove",
}

enum OptionName {
  User = "user",
  // DurationType = "duration",
  // DurationValue = "value",
}

// enum DurationType {
//   Minutes = "minutes",
//   Hours = "hours",
//   Days = "days",
// }

export default class MuteCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Manage user timeouts")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.List)
        .setDescription("List all active timeouts"),
    )
  // .addSubcommand((subcommand) =>
  //   subcommand
  //     .setName(SubcommandName.Add)
  //     .setDescription("Add user timeout")
  //     .addUserOption((option) =>
  //       option
  //         .setName(OptionName.User)
  //         .setDescription("The user to timeout")
  //         .setRequired(true),
  //     )
  //     .addStringOption((option) =>
  //       option
  //         .setName(OptionName.DurationType)
  //         .setDescription("Timeout duration type")
  //         .setChoices(
  //           ...Object.entries(DurationType).map(([name, value]) => ({
  //             name,
  //             value,
  //           })),
  //         )
  //         .setRequired(true),
  //     )
  //     .addIntegerOption((option) =>
  //       option
  //         .setName(OptionName.DurationValue)
  //         .setDescription("Timeout duration value")
  //         .setMinValue(1)
  //         .setRequired(true),
  //     ),
  // )
  // .addSubcommand((subcommand) =>
  //   subcommand
  //     .setName(SubcommandName.Remove)
  //     .setDescription("Remove user timeout")
  //     .addUserOption((option) =>
  //       option
  //         .setName(OptionName.User)
  //         .setDescription("The user to remove timeout from")
  //         .setRequired(true),
  //     ),
  // )

  static permissions = permission({
    type: "either",
    permissions: [
      PermissionFlags.ModerateMembers,
      PermissionFlags.NitroBooster,
    ],
  })

  async execute() {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.List:
        await this.#handleList()
        break

      // case SubcommandName.Add:
      //   await this.#handleAdd()
      //   break

      // case SubcommandName.Remove:
      //   await this.#handleRemove()
      //   break

      default:
        checkUnreachable(subcommand)
    }
  }

  async #handleList() {
    const timedOutMembers = this.guild.members.cache.filter(isTimedOut)

    this.reply({
      ephemeral: true,
      content: !timedOutMembers.size ? "No one is timed out" : undefined,
      embeds: timedOutMembers.size
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

  // async #handleAdd() {
  //   // Parse input member
  //   const user = this.interaction.options.getUser(OptionName.User, true)
  //   const member = this.guild.members.cache.get(user.id)

  //   if (!member) {
  //     this.fail("User not found")
  //     return
  //   }

  //   if (isTimedOut(member)) {
  //     this.fail("User is already timed out")
  //     return
  //   }

  //   // Parse input date
  //   const durationType = this.interaction.options.getString(
  //     OptionName.DurationType,
  //     true,
  //   ) as DurationType
  //   const durationValue = this.interaction.options.getInteger(
  //     OptionName.DurationValue,
  //     true,
  //   )

  //   // TODO nitro boosters can't mute for a longer time than 5 mins
  //   // TODO nitro boosters can't add penalty

  //   // Parse the penalty duration
  //   const model = new TimeoutModel(member)
  //   const entity = await model.get()

  //   const msSincePrevious = entity ? d().diff(entity.until, "ms") : 0

  //   this.reply({
  //     ephemeral: true,
  //     content: "TODO",
  //   })
  // }

  // async #handleRemove() {
  //   this.reply({
  //     ephemeral: true,
  //     content: "TODO",
  //   })
  // }
}
