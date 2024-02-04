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

class BaseCommand {
  constructor(protected interaction: ChatInputCommandInteraction) {}

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

  reply(options: string | MessagePayload | InteractionReplyOptions) {
    return this.interaction.reply(options) as unknown as Promise<Message>
  }

  editReply(options: string | MessagePayload | InteractionReplyOptions) {
    return this.interaction.editReply(options) as Promise<Message>
  }

  fail(message?: string) {
    return this.reply({
      content: message ?? "Unable to execute the command",
      ephemeral: true,
    })
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
