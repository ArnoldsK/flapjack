import {
  ChatInputCommandInteraction,
  Client,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  InteractionReplyOptions,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  User,
} from "discord.js"

import { Permission, permission } from "~/server/utils/permission"
import { BaseContext } from "~/types"

export class BaseCommand {
  constructor(
    protected context: BaseContext,
    protected interaction: Omit<ChatInputCommandInteraction, "deferReply">,
  ) {}

  /**
   * Version allows to check whether remote commands must be updated
   * Will throw if the version is not set to at least 1 on the command
   */
  static version = 0

  /**
   * Dynamic version ignores lower version inconsistency when checking for API differences
   */
  static dynamicVersion = false

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
   * Is the command visible only to the user?
   * Defaults to always visible.
   */
  get isEphemeral(): boolean {
    return false
  }

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

  async reply(options: string | Omit<InteractionReplyOptions, "ephemeral">) {
    try {
      return await this.interaction[
        this.interaction.deferred ? "editReply" : "reply"
      ](options)
    } catch (error) {
      // Message is most likely deleted
      console.error("Failed to reply!", error)
    }
  }

  /**
   * Generic success message
   */
  success() {
    return this.reply({
      content: "Success!",
    })
  }

  getSubcommand<T>(): T {
    return this.interaction.options.getSubcommand(true) as T
  }
}
