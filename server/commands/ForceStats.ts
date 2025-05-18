import {
  APIApplicationCommandOptionChoice,
  SlashCommandBuilder,
} from "discord.js"
import { BaseCommand } from "~/server/base/Command"
import { permission, PermissionFlags } from "~/server/utils/permission"
import { cronTasks } from "~/server/cron"
import { stringToIntHash } from "~/server/utils/string"
import { assert } from "~/server/utils/error"

const cronTaskNames = cronTasks
  .map((task) => task.description)
  .sort((a, b) => a.localeCompare(b))

// HACK: Ensure the command is updated on cron task changes
const version = stringToIntHash(cronTaskNames.join(""))

const choices: APIApplicationCommandOptionChoice<string>[] = cronTaskNames.map(
  (name) => ({
    name: name,
    value: name,
  }),
)

enum OptionName {
  Task = "task",
}

export default class ForceStatsCommand extends BaseCommand {
  static version = version

  static command = new SlashCommandBuilder()
    .setName("force-task")
    .setDescription("Force run a task")
    .addStringOption((option) =>
      option
        .setName(OptionName.Task)
        .setDescription("Which task to run?")
        .setChoices(...choices)
        .setRequired(true),
    )

  static permissions = permission({
    type: "allow",
    permissions: [PermissionFlags.Administrator],
  })

  async execute() {
    const taskName = this.interaction.options.getString(OptionName.Task, true)

    await this.interaction.deferReply({
      ephemeral: true,
    })

    try {
      const cronTask = cronTasks.find((task) => task.description === taskName)
      assert(!!cronTask, "Task not found")

      await cronTask.task(this.context)

      this.editReply("Task complete")
    } catch (error) {
      this.editReply("Failed to run the task")
      console.error(`Failed to force run "${taskName}" task`, error)
    }
  }
}
