import { BaseCommand } from "../base/Command"
import { importDirectoryDefaults } from "../utils/import"

export const getCommands = () =>
  importDirectoryDefaults<typeof BaseCommand>(__dirname)
