import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

export const appConfig = {
  dev: Boolean(process.env.DEV),

  web: {
    port: parseInt(process.env.WEB_PORT || "3000"),
    baseUrl: process.env.WEB_BASE_URL || "http://localhost:3000",
  },

  discord: {
    token: process.env.DISCORD_TOKEN || "",
    client: process.env.DISCORD_TOKEN || "",

    ids: {
      guild: "411593263615836172",
      roles: {
        nitroBooster: "611953929835643024",
      },
      users: {
        owner: "221755442513051649",
      },
    },
  },
}
