import {
  ChatInputCommandInteraction,
  Client,
  Guild,
  GuildMember,
  InteractionReplyOptions,
  Message,
  MessagePayload,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  TextBasedChannel,
  User,
} from "discord.js"

import { Permission, permission } from "../utils/permission"

class BaseCommand {
  constructor(protected interaction: ChatInputCommandInteraction) {}

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
  async execute() {}

  get client(): Client {
    return this.interaction.client
  }

  get channel(): TextBasedChannel | null {
    return this.interaction.channel
  }

  get user(): User {
    return this.interaction.user
  }

  get guild(): Guild {
    return this.interaction.guild!
  }

  get member(): GuildMember {
    return this.interaction.member! as GuildMember
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
}

export { BaseCommand }
