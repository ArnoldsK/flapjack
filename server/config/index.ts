import { loadEnvConfig } from "@next/env"
import { z } from "zod"

loadEnvConfig(process.cwd())

const env = z
  .object({
    DEV: z.string(),
    WEB_PORT: z.string(),
    WEB_BASE_URL: z.string(),
    DB_HOST: z.string(),
    DB_PORT: z.string(),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_DATABASE: z.string(),
    DISCORD_TOKEN: z.string(),
    DISCORD_CLIENT: z.string(),
    LOCAL_COMMANDS: z.string().default("false"),
    WEB_ONLY: z.string().default("false"),
    GIPHY_API_KEY: z.string(),
    HOSTING_AUTH_NAME: z.string(),
    HOSTING_AUTH_TOKEN: z.string(),
  })
  .parse(process.env)

const port = Number.parseInt(env.WEB_PORT, 10)

export const appConfig = {
  dev: env.DEV === "true",

  /**
   * Initialize the Discord client but don't run any events.
   */
  webOnly: env.WEB_ONLY === "true",

  db: {
    host: env.DB_HOST,
    port: Number.parseInt(env.DB_PORT, 10),
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
  },

  giphy: {
    apiKey: env.GIPHY_API_KEY,
  },

  hosting: {
    url: "https://hosting.pepsidog.lv",
    authName: env.HOSTING_AUTH_NAME,
    authToken: env.HOSTING_AUTH_TOKEN,
  },
}
