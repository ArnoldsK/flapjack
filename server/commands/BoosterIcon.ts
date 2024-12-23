import {
  Emoji,
  GuildEmoji,
  GuildEmojiCreateOptions,
  parseEmoji,
  RoleCreateOptions,
  SlashCommandBuilder,
} from "discord.js"
import { BaseCommand } from "../base/Command"
import { PermissionFlags, permission } from "../utils/permission"
import { checkUnreachable } from "../utils/error"
import { BOOSTER_ICON_ROLE_PREFIX } from "../constants"
import {
  getMemberBoosterIconRoleName,
  getMemberBoosterIconRole,
  getOrCreateRole,
} from "../utils/role"
import { getEmojiIdFromString, getNativeEmojiFromString } from "../utils/emoji"

enum SubcommandName {
  Emoji = "emoji",
  Custom = "custom",
  Remove = "remove",
}

enum OptionName {
  Value = "value",
}

export class BoosterIconCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("booster-icon")
    .setDescription("Choose your server booster name icon")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Emoji)
        .setDescription("Set an emoji as the icon")
        .addStringOption((option) =>
          option
            .setName(OptionName.Value)
            .setDescription(
              "Input the emoji. Can only be either a native emoji, or a server emoji. GIFs won't move.",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Custom)
        .setDescription("Set a custom image as the icon")
        .addAttachmentOption((option) =>
          option
            .setName(OptionName.Value)
            .setDescription(
              "Upload the image. GIFs won't move. Follow the server and Discord ToS.",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Remove)
        .setDescription("Remove the icon"),
    )

  static permissions = permission({
    type: "allow",
    permissions: [PermissionFlags.NitroBooster],
  })

  async execute() {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.Emoji:
        await this.#handleEmoji()
        return

      case SubcommandName.Custom:
        await this.#handleCustom()
        return

      case SubcommandName.Remove:
        await this.#handleRemove()
        return

      default:
        checkUnreachable(subcommand)
    }
  }

  #parseEmojiString(
    value: string,
  ): Pick<RoleCreateOptions, "icon" | "unicodeEmoji"> | undefined {
    value = value.trim()

    // Guild emoji
    const emojiId = getEmojiIdFromString(value)
    if (emojiId) {
      return {
        icon: this.guild.emojis.cache.get(emojiId),
      }
    }

    // Try finding by name
    const emoji = this.guild.emojis.cache.find(
      (emoji) => emoji.name?.toLowerCase() === value.toLowerCase(),
    )
    if (emoji) {
      return {
        icon: emoji,
      }
    }

    // Native emoji
    const nativeEmoji = getNativeEmojiFromString(value)
    if (nativeEmoji) {
      return {
        unicodeEmoji: nativeEmoji,
      }
    }

    // Must be a troll
    return undefined
  }

  async #handleEmoji() {
    const value = this.interaction.options.getString(OptionName.Value, true)

    try {
      const emojiOption = this.#parseEmojiString(value)
      if (!emojiOption) {
        throw new Error("Unable to get the emoji")
      }

      const role = await getOrCreateRole(this.guild, {
        name: getMemberBoosterIconRoleName(this.member),
        ...emojiOption,
      })

      if (this.member.roles.cache.has(role.id)) {
        await role.edit(emojiOption)
      } else {
        await this.member.roles.add(role)
      }

      this.success()
    } catch {
      this.fail(
        "Emoji not found, or it's not in this server. Try selecting from the emoji picker.",
      )
    }
  }

  async #handleCustom() {
    const value = this.interaction.options.getAttachment(OptionName.Value, true)

    try {
      if (!value.contentType?.startsWith("image/")) {
        throw new Error("Not an image")
      }

      const role = await getOrCreateRole(this.guild, {
        name: getMemberBoosterIconRoleName(this.member),
        icon: value.url,
      })

      if (this.member.roles.cache.has(role.id)) {
        await role.edit({
          icon: value.url,
        })
      } else {
        await this.member.roles.add(role)
      }

      this.success()
    } catch {
      this.fail("Not an image, or the image is not supported.")
    }
  }

  async #handleRemove() {
    const iconRole = getMemberBoosterIconRole(this.member)

    if (iconRole) {
      // Delete role itself because it's per-user
      await iconRole.delete()
    }

    this.success()
  }
}
