import { loadEnvConfig } from "@next/env"
import { z } from "zod"

loadEnvConfig(process.cwd())

const env = z
  .object({
    DEV: z.string(),
    WEB_PORT: z.string(),
    WEB_BASE_URL: z.string(),
    DB_TYPE: z.string(),
    DB_HOST: z.string(),
    DB_PORT: z.string(),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_DATABASE: z.string(),
    DISCORD_TOKEN: z.string(),
    DISCORD_CLIENT: z.string(),
    LOCAL_COMMANDS: z.string().default("false"),
    GIPHY_API_KEY: z.string(),
    DEEPL_AUTH_KEY: z.string(),
  })
  .parse(process.env)

const port = parseInt(env.WEB_PORT, 10)

export const appConfig = {
  dev: env.DEV === "true",

  db: {
    type: env.DB_TYPE,
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT, 10),
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
  },

  web: {
    port,
    baseUrl: env.WEB_BASE_URL,
  },

  discord: {
    token: env.DISCORD_TOKEN,
    client: env.DISCORD_CLIENT,
    localCommands: env.LOCAL_COMMANDS === "true",

    ids: {
      guild: "411593263615836172",
      roles: {
        nitroBooster: "611953929835643024",
        upperClass: "1159244242074468503",
        activeMember: "669608043713003521",
        poe: "1354946502589550673",
      },
      users: {
        owner: "221755442513051649",
      },
      categories: {
        archive: "525995353821151242",
        moderation: "625639453867900938",
      },
      channels: {
        general: "411593264211296258",
        bepsi: "414516218767081474",
        casino: "621834853696143360",
        nsfw: "632985833414066176",
        logs: "546830997983854592",
        upperClass: "868434446502723625",
        runescape: "717772755508002816",
        copyPasta: "673897295598845952",
        vTubers: "829428335288516619",
        numbersGame: "831055945022963742",
        minecraft: "584768527454568448",
        poe: "701811325042688070",
        videos: "581643451419066368",
        garage: "743552656043409445",
      },
    },
  },

  giphy: {
    apiKey: env.GIPHY_API_KEY,
  },

  deepl: {
    authKey: env.DEEPL_AUTH_KEY,
  },
}

export const discordIds = appConfig.discord.ids
