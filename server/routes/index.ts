import { Route } from "../utils/routes"
import { importDirectoryDefaults } from "../utils/import"

export const getRoutes = () => importDirectoryDefaults<Route>(__dirname)
