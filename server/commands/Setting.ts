import { codeBlock, SlashCommandBuilder } from "discord.js"

import { Unicode } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import {
  DEFAULT_SETTINGS,
  SettingKey,
  settingsSchema,
  SettingModel,
} from "~/server/db/model/Setting"
import { checkUnreachable } from "~/server/utils/error"
import { PermissionFlags, permission } from "~/server/utils/permission"

enum SubcommandName {
  Set = "set",
  List = "list",
}

enum OptionName {
  Key = "key",
  Value = "value",
}

// ! Must increase version on any change
const SETTING_KEY_CHOICES = Object.entries({
  "tasks.hourlyGifBanners.enabled": true,
} satisfies Record<SettingKey, boolean>).map(([key]) => ({
  name: `${key} ${Unicode.longDash} ${typeof DEFAULT_SETTINGS[
    key as SettingKey
  ]}`,
  value: key,
}))

export default class SettingCommand extends BaseCommand {
  static version = 2

  static command = new SlashCommandBuilder()
    .setName("setting")
    .setDescription("Bot settings")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Set)
        .setDescription("Modify bot setting")
        .addStringOption((option) =>
          option
            .setName(OptionName.Key)
            .setDescription("Setting key")
            .addChoices(...SETTING_KEY_CHOICES)
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName(OptionName.Value)
            .setDescription("Setting value - will be JSON parsed")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.List)
        .setDescription("List all settings and values"),
    )

  static permissions = permission({
    type: "either",
    permissions: [PermissionFlags.ClientOwner, PermissionFlags.Administrator],
  })

  async execute() {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.Set: {
        await this.#handleSet()
        break
      }

      case SubcommandName.List: {
        await this.#handleList()
        break
      }

      default: {
        checkUnreachable(subcommand)
      }
    }
  }

  async #handleSet() {
    const key = this.interaction.options.getString(
      OptionName.Key,
      true,
    ) as SettingKey
    const valueRaw = this.interaction.options.getString(OptionName.Value, true)

    try {
      // Eval the raw value as all settings and parse as whole
      // Mental gymnastics but it's auto-magic this way
      const value = settingsSchema.parse({
        ...DEFAULT_SETTINGS,
        [key]: JSON.parse(valueRaw),
      })[key]

      const model = new SettingModel(this.context)
      await model.set(key, value)

      this.success()
    } catch {
      this.fail("Unable to set the setting... incorrect value type?")
    }
  }

  async #handleList() {
    const model = new SettingModel(this.context)
    const settings = await model.getAll()

    this.reply({
      ephemeral: true,
      content: codeBlock(
        Object.entries(settings)
          .map(
            ([key, value]) =>
              `${key} ${Unicode.longDash} ${JSON.stringify(value)}`,
          )
          .join("\n"),
      ),
    })
  }
}
