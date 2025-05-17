import {
  ChatInputCommandInteraction,
  Client,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  InteractionReplyOptions,
  Message,
  MessagePayload,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  User,
} from "discord.js"

import { Permission, permission } from "../utils/permission"
import { BaseContext } from "../../types"

class BaseCommand {
  constructor(
    protected context: BaseContext,
    protected interaction: ChatInputCommandInteraction,
  ) {}

  /**
   * Version allows to check whether remote commands must be updated
   * Will throw if the version is not set to at least 1 on the command
   */
  static version = 0

  /**
   * Command builder
   */
  static command:
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | SlashCommandSubcommandsOnlyBuilder = new SlashCommandBuilder()

  /**
   * Permissions required to execute
   */
  static permissions: Permission = permission({
    type: "deny",
    permissions: [],
  })

  /**
   * Allow only in specific channels
   */
  static channels: string[] = []

  /**
   * Execute the command
   */
  async execute(): Promise<void> {}

  get client(): Client {
    return this.interaction.client
  }

  get channel(): GuildTextBasedChannel {
    return this.interaction.channel as GuildTextBasedChannel
  }

  get user(): User {
    return this.interaction.user
  }

  get guild(): Guild {
    return this.interaction.guild!
  }

  get member(): GuildMember {
    return this.interaction.member as GuildMember
  }

  async reply(options: string | MessagePayload | InteractionReplyOptions) {
    try {
      return await this.interaction.reply(options)
    } catch {
      // Message is most likely deleted
    }
  }

  async editReply(options: string | MessagePayload | InteractionReplyOptions) {
    try {
      return await this.interaction.editReply(options)
    } catch {
      // Message is most likely deleted
    }
  }

  fail(message?: string) {
    // This error is handled in the top level execute try catch
    throw new Error(message ?? "Unable to execute the command")
  }

  success(message?: string) {
    return this.reply({
      content: message ?? "Success!",
      ephemeral: true,
    })
  }

  deny() {
    return this.reply({
      content: "No permission to use this command",
      ephemeral: true,
    })
  }

  getSubcommand<T>(): T {
    return this.interaction.options.getSubcommand(true) as T
  }
}

export { BaseCommand }
