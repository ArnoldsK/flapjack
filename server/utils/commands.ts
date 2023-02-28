import { ChatInputCommandInteraction, GuildMember } from "discord.js"
import { BaseCommand } from "../base/Command"
import { commands } from "../commands"
import { UNICODE } from "../constants"
import { assert } from "./error"
import { getPermissionFlagName, memberHasPermission } from "./permission"

export interface SetupCommand {
  [key: string]: unknown
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

const parseDescription = (Command: typeof BaseCommand): string => {
  const { type, permissions } = Command.permissions
  const elements = [Command.command.description]

  if ((type === "allow" || type === "either") && permissions.length) {
    const names = permissions
      .map(getPermissionFlagName)
      .filter((name): name is string => !!name)

    if (names.length) {
      elements.push(...names)
    }
  }

  return elements.join(` ${UNICODE.middot} `)
}

export const getSetupCommands = () => {
  return commands.map((Command) => {
    return {
      ...Command.command.toJSON(),

      description: parseDescription(Command),

      execute: async (interaction) => {
        // #############################################################################
        // Initialize
        // #############################################################################
        const command = new Command(interaction)

        // Has a member
        const member = interaction.member
        assert(!!member, "Member not found")

        // #############################################################################
        // Permissions
        // #############################################################################
        if (!memberHasPermission(member as GuildMember, Command.permissions)) {
          await command.deny()
          return
        }

        // #############################################################################
        // Channel
        // #############################################################################
        if (
          Command.channels.length &&
          !Command.channels.includes(interaction.channelId)
        ) {
          await command.fail("Can't use in this channel")
          return
        }

        // #############################################################################
        // Execute
        // #############################################################################
        await command.execute()
      },
    } satisfies SetupCommand
  })
}
