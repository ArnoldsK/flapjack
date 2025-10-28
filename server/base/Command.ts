import {
  ChatInputCommandInteraction,
  Client,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  InteractionEditReplyOptions,
  MessageFlags,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  User,
} from "discord.js"

import { assert } from "~/server/utils/error"
import { Permission, permission } from "~/server/utils/permission"
import { BaseContext } from "~/types"

export class BaseCommand {
  constructor(
    public context: BaseContext,
    public interaction: Omit<ChatInputCommandInteraction, "deferReply">,
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
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()

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
   * Sets the reply chain to be using V2 components.
   */
  get isComponentsV2(): boolean {
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

  async reply(
    contentOrOptions: string | Omit<InteractionEditReplyOptions, "flags">,
  ) {
    const options: InteractionEditReplyOptions =
      typeof contentOrOptions === "string"
        ? { content: contentOrOptions }
        : contentOrOptions

    // All interactions are deferred at the top-level, so assert it
    assert(!!this.interaction.deferred, "Message was not deferred")

    return await this.interaction.editReply({
      ...options,
      flags: this.isComponentsV2 ? MessageFlags.IsComponentsV2 : undefined,
    })
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
