import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

const port = parseInt(process.env.WEB_PORT || "3000")

export const appConfig = {
  dev: process.env.DEV === "true",

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
      },
      users: {
        owner: "221755442513051649",
      },
      categories: {
        archive: "525995353821151242",
      },
    },
  },
}
