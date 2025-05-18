import { join } from "path"
import { DataSource } from "typeorm"
import { appConfig } from "~/server/config"

export const db = new DataSource({
  // @ts-expect-error yolo
  type: appConfig.db.type,
  host: appConfig.db.host,
  port: appConfig.db.port,
  username: appConfig.db.username,
  password: appConfig.db.password,
  database: appConfig.db.database,
  logging: false,
  entities: [join(__dirname, "db", "entity", "*.{ts,js}")],
  subscribers: [],
  migrations: [join(__dirname, "db", "migration", "*.{ts,js}")],
  // Auto-update tables
  synchronize: true,
  // Screw migrations... I tried, it's a pain with MySQL
  migrationsRun: false,
})
