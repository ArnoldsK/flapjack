import { BaseCommand } from "~/server/base/Command"
import { importDirectoryDefaults } from "~/server/utils/import"

export const getCommands = () =>
  importDirectoryDefaults<typeof BaseCommand>(__dirname)
