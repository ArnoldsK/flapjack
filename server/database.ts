import { join } from "path"
import { DataSource } from "typeorm"
import { appConfig } from "./config"

export const db = new DataSource({
  // @ts-expect-error yolo
  type: appConfig.db.type,
  host: appConfig.db.host,
  port: appConfig.db.port,
  username: appConfig.db.username,
  password: appConfig.db.password,
  database: appConfig.db.database,
  logging: false,
  entities: [join(__dirname, "entity", "*.{ts,js}")],
  subscribers: [],
  migrations: [join(__dirname, "migration", "*.{ts,js}")],
  // Auto-update tables
  synchronize: false,
  // Run migrations for table removals
  migrationsRun: true,
})
