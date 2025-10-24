import {
  APIApplicationCommand,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  GuildMember,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js"

import { DISCORD_IDS, Unicode } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { getCommands } from "~/server/commands"
import { appConfig } from "~/server/config"
import { CommandExecuteModel } from "~/server/db/model/CommandExecute"
import { dedupe } from "~/server/utils/array"
import { assert } from "~/server/utils/error"
import {
  getPermissionFlagName,
  memberHasPermission,
} from "~/server/utils/permission"
import { BaseContext } from "~/types"

export type SetupCommand = RESTPostAPIChatInputApplicationCommandsJSONBody & {
  dynamicVersion: boolean
  handleExecute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

const getCommandVersion = (command: {
  name: string
  description: string
}): number => {
  const matches = command.description.match(/v([0-9]+)$/)
  const versionString = matches?.[1]
  assert(!!versionString, `${command.name} has no version specified`)

  const version = Number.parseInt(versionString)
  assert(!Number.isNaN(version), `${command.name} has no valid version`)

  return version
}

const parseDescription = (Command: typeof BaseCommand): string => {
  const { type, permissions } = Command.permissions
  const elements = [Command.command.description]

  if ((type === "allow" || type === "either") && permissions.length > 0) {
    const names = permissions
      .map(getPermissionFlagName)
      .filter((name): name is string => !!name)

    if (names.length > 0) {
      elements.push(...names)
    }
  }

  assert(Command.version > 0, `${Command.name} does not have a version`)
  elements.push(`v${Command.version}`)

  return dedupe(elements).join(` ${Unicode.middot} `)
}

export const getSetupCommands = async (
  context: BaseContext,
): Promise<SetupCommand[]> => {
  const commands = await getCommands()

  return commands.map((Command) => {
    return {
      ...Command.command.toJSON(),

      description: parseDescription(Command),

      dynamicVersion: Command.dynamicVersion,

      handleExecute: async (interaction) => {
        const command = new Command(context, interaction)

        // #############################################################################
        // Validate
        // #############################################################################
        assert(!!interaction.inGuild(), "Not in guild")

        const guild = interaction.client.guilds.cache.get(interaction.guildId)
        assert(!!guild, "Guild not found")

        const channel = guild.channels.cache.get(interaction.channelId)
        assert(!!channel, "Channel not found")

        const member = interaction.member
        assert(!!member, "Member not found")

        // Permission
        assert(
          memberHasPermission(member as GuildMember, Command.permissions),
          "No permission to use the command",
        )

        // Channel
        assert(
          Command.channels.length === 0 ||
            Command.channels.includes(interaction.channelId),
          "Can't use the command in this channel",
        )

        // Always defer
        await interaction.deferReply({ ephemeral: command.isEphemeral })

        // Execute
        await command.execute()

        // #############################################################################
        // Statistics
        // #############################################################################
        const model = new CommandExecuteModel(context)
        await model.create({
          input: interaction.toString(),
          commandName: interaction.commandName,
          userId: interaction.user.id,
          channelId: interaction.channelId,
        })
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
      DISCORD_IDS.guild,
    ),
    {
      body: [],
    },
  )
}

export const handleApiCommands = async (commands: SetupCommand[]) => {
  // Setup commands on dev only if allowed
  if (appConfig.dev && !appConfig.discord.localCommands) return

  const rest = new REST({ version: "10" }).setToken(appConfig.discord.token)
  const apiCommands = (await rest.get(
    Routes.applicationGuildCommands(
      appConfig.discord.client,
      DISCORD_IDS.guild,
    ),
  )) as APIApplicationCommand[]

  // Update is an override so there's a single update body with all API commands
  const updateCommands: Omit<
    SetupCommand,
    "handleExecute" | "dynamicVersion"
  >[] = apiCommands.map((el) => ({
    ...el,
    type: el.type === ApplicationCommandType.ChatInput ? el.type : undefined,
  }))

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
    } else if (
      version > apiVersion ||
      command.dynamicVersion ||
      appConfig.dev
    ) {
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
      DISCORD_IDS.guild,
    ),
    {
      body: updateCommands,
    },
  )

  // Delete commands
  const deleteCommands = apiCommands.filter(
    (apiCommand) =>
      !commands.some((command) => command.name === apiCommand.name),
  )

  if (deleteCommands.length > 0) {
    for (const deleteCommand of deleteCommands) {
      console.log("> Commands > Delete >", deleteCommand.name)
      await rest.delete(
        Routes.applicationGuildCommand(
          appConfig.discord.client,
          DISCORD_IDS.guild,
          deleteCommand.id,
        ),
      )
    }
  }
}
