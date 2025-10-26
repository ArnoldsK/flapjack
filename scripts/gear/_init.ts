import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { osrsItemByName } from "~/constants/osrs"
import { isNonNullish } from "~/server/utils/boolean"

const NAMES_FILE = path.join(__dirname, "/names.yaml")

if (!existsSync(NAMES_FILE)) {
  writeFileSync(NAMES_FILE, "")
}

const namesFile = readFileSync(NAMES_FILE)

const itemNamesFromFile = namesFile
  .toString()
  .split("\n")
  .map((el) => el.trim())
  .filter((el) => !!el && !el.startsWith("#"))

export const items = itemNamesFromFile
  .map((name) => osrsItemByName.get(name))
  .filter(isNonNullish)
