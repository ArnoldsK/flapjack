import { BaseCommand } from "~/server/base/Command"
import { importDirectoryDefaults } from "~/server/utils/file"

export const getCommands = () =>
  importDirectoryDefaults<typeof BaseCommand>(__dirname)
