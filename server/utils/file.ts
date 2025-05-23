import { readdirSync } from "node:fs"
import path from "node:path"

import { isNonNullish } from "~/server/utils/boolean"

const getImportableDirectoryFiles = (dir: string) => {
  return readdirSync(dir)
    .filter(
      (file) =>
        (file.endsWith(".ts") || file.endsWith(".js")) &&
        !file.startsWith("index"),
    )
    .map((file) => path.join(dir, file.replace(/\.(t|s)s$/, "")))
}

/**
 * Import and return all directory file `default` exports.
 *
 * For use in index files. Index files are excluded from the import.
 *
 * @example
 * ```ts
 * import { importDirectoryDefaults } from "~/server/utils/utils/file"
 *
 * export const getRoutes = () => importDirectoryDefaults<Route>(__dirname)
 * ```
 */
export const importDirectoryDefaults = async <TDefault>(
  dir: string,
): Promise<TDefault[]> => {
  const files = getImportableDirectoryFiles(dir)
  const imports = await Promise.all(
    files.map(async (file) => {
      try {
        const imported = await import(file)
        return imported.default
      } catch (error) {
        console.error(`Error importing file ${file}:`, error)
        return null
      }
    }),
  )

  return imports.filter(isNonNullish)
}
