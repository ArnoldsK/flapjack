import {
  APIApplicationCommand,
  ChatInputCommandInteraction,
  GuildMember,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js"
import { BaseCommand } from "../base/Command"
import { commands } from "../commands"
import { Unicode } from "../constants"
import { assert } from "./error"
import { getPermissionFlagName, memberHasPermission } from "./permission"
import { dedupe } from "./array"
import { appConfig } from "../config"
import { createHash } from "crypto"

export type SetupCommand = RESTPostAPIChatInputApplicationCommandsJSONBody & {
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

const getCommandVersion = (command: {
  name: string
  description: string
}): number => {
  const matches = command.description.match(/v([0-9]+)$/)
  const versionString = matches?.[1]
  assert(!!versionString, `${command.name} has no version specified`)

  const version = parseInt(versionString)
  assert(!Number.isNaN(version), `${command.name} has no valid version`)

  return version
}

const parseName = (Command: typeof BaseCommand): string => {
  const name = Command.command.name

  // Encrypt the names on the dev bot so it doesn't clash
  if (appConfig.dev) {
    return createHash("md5").update(name).digest("hex")
  }

  return name
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

  assert(Command.version > 0, `${Command.name} does not have a version`)
  elements.push(`v${Command.version}`)

  return dedupe(elements).join(` ${Unicode.middot} `)
}

export const getSetupCommands = (): SetupCommand[] => {
  return commands.map((Command) => {
    return {
      ...Command.command.toJSON(),
      name: parseName(Command),
      description: parseDescription(Command),

      execute: async (interaction) => {
        assert(!!interaction.inGuild(), "Not in guild")

        // #############################################################################
        // Validate
        // #############################################################################
        const guild = interaction.client.guilds.cache.get(interaction.guildId)
        assert(!!guild, "Guild not found")

        const channel = guild.channels.cache.get(interaction.channelId)
        assert(!!channel, "Channel not found")

        const member = interaction.member
        assert(!!member, "Member not found")

        // #############################################################################
        // Initialize
        // #############################################################################
        const command = new Command(interaction)

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

export const handleApiCommands = async (
  commands: SetupCommand[],
  silent = false,
) => {
  const rest = new REST({ version: "10" }).setToken(appConfig.discord.token)
  const route = Routes.applicationGuildCommands(
    appConfig.discord.client,
    appConfig.discord.ids.guild,
  )

  const apiCommands = (await rest.get(route)) as APIApplicationCommand[]
  const mustUpdate =
    commands.length !== apiCommands.length ||
    commands.some((command) => {
      const apiCommand = apiCommands.find(
        (apiCommand) => apiCommand.name === command.name,
      )

      return (
        !apiCommand ||
        getCommandVersion(apiCommand) !== getCommandVersion(command)
      )
    })

  if (!mustUpdate) return

  !silent && console.log("> Updating API commands")

  await rest.put(route, {
    body: commands,
  })
}
