import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

const port = parseInt(process.env.WEB_PORT || "3000")

export const appConfig = {
  dev: process.env.DEV === "true",

  db: {
    type: process.env.DB_TYPE || "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_DATABASE || "flapjack",
  },

  web: {
    port,
    baseUrl: process.env.WEB_BASE_URL || `http://localhost:${port}`,
  },

  discord: {
    token: process.env.DISCORD_TOKEN || "",
    client: process.env.DISCORD_CLIENT || "",

    ids: {
      guild: "411593263615836172",
      roles: {
        nitroBooster: "611953929835643024",
        upperClass: "1159244242074468503",
      },
      users: {
        owner: "221755442513051649",
      },
      categories: {
        archive: "525995353821151242",
      },
      channels: {
        general: "411593264211296258",
        casino: "621834853696143360",
        nsfw: "632985833414066176",
        logs: "546830997983854592",
        upperClass: "868434446502723625",
        runescape: "717772755508002816",
      },
    },
  },
}

export const discordIds = appConfig.discord.ids
