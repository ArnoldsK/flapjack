import { importDirectoryDefaults } from "~/server/utils/file"
import { Route } from "~/server/utils/routes"

export const getRoutes = () => importDirectoryDefaults<Route>(__dirname)
