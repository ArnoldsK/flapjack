import {
  APIApplicationCommand,
  ApplicationCommandType,
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
import { BaseContext } from "../types"

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

export const getSetupCommands = (context: BaseContext): SetupCommand[] => {
  return commands.map((Command) => {
    return {
      ...Command.command.toJSON(),

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
        const command = new Command(context, interaction)

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

export const removeApiCommands = async () => {
  const rest = new REST({ version: "10" }).setToken(appConfig.discord.token)

  console.log("> Commands > Delete all")
  await rest.put(
    Routes.applicationGuildCommands(
      appConfig.discord.client,
      appConfig.discord.ids.guild,
    ),
    {
      body: [],
    },
  )
}

export const handleApiCommands = async (commands: SetupCommand[]) => {
  const rest = new REST({ version: "10" }).setToken(appConfig.discord.token)
  const apiCommands = (await rest.get(
    Routes.applicationGuildCommands(
      appConfig.discord.client,
      appConfig.discord.ids.guild,
    ),
  )) as APIApplicationCommand[]

  // Due to how updating works, create a single update body based on current API commands
  const updateCommands: Omit<SetupCommand, "execute">[] = apiCommands.map(
    (el) => ({
      ...el,
      type: el.type === ApplicationCommandType.ChatInput ? el.type : undefined,
    }),
  )

  // Add new commands
  for (const command of commands) {
    const apiCommandIndex = apiCommands.findIndex(
      (el) => el.name === command.name,
    )
    const apiCommand = apiCommands[apiCommandIndex]

    if (!apiCommand) {
      console.log("> Commands > Create >", command.name)
      updateCommands.push(command)
      continue
    }

    const apiVersion = getCommandVersion(apiCommand)
    const version = getCommandVersion(command)

    if (version === apiVersion) {
      // Do nothing
    } else if (version > apiVersion || appConfig.dev) {
      console.log("> Commands > Update >", command.name)
      updateCommands[apiCommandIndex] = command
    } else if (version < apiVersion) {
      console.log("> Commands > Outdated local version >", command.name)
      console.log(`             API version: ${apiVersion}`)
    }
  }

  await rest.put(
    Routes.applicationGuildCommands(
      appConfig.discord.client,
      appConfig.discord.ids.guild,
    ),
    {
      body: updateCommands,
    },
  )

  // Delete commands
  const deleteCommands = apiCommands.filter((apiCommand) =>
    commands.some((command) => command.name === apiCommand.name),
  )

  if (deleteCommands.length) {
    for (const deleteCommand of deleteCommands) {
      console.log("> Commands > Delete >", deleteCommand.name)
      await rest.delete(
        Routes.applicationGuildCommand(
          appConfig.discord.client,
          appConfig.discord.ids.guild,
          deleteCommand.id,
        ),
      )
    }
  }
}
