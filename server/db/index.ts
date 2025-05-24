import { MikroORM } from "@mikro-orm/mysql"

import config from "~/server/config/db"

export const createConnection = async () => {
  return await MikroORM.init(config)
}
