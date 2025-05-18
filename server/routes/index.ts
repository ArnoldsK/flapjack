import { Route } from "~/server/utils/routes"
import { importDirectoryDefaults } from "~/server/utils/import"

export const getRoutes = () => importDirectoryDefaults<Route>(__dirname)
