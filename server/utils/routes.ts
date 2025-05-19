import { Express, Request, RequestHandler, Response } from "express"

import { getRoutes } from "~/server/routes"
import { BaseContext } from "~/types"

type Method = "get" | "post" | "put" | "delete"

export interface Route {
  path: `/${string}`
  method?: Method
  middlewares?: RequestHandler[]
  handler: (context: BaseContext, req: Request, res: Response) => Promise<void>
}

export const createRoute = (route: Route): Route => route

export const handleCustomRoutes = async (
  context: BaseContext,
  server: Express,
) => {
  const routes = await getRoutes()

  for (const route of routes) {
    const method = route.method ?? "get"
    const middlewares = route.middlewares ?? []

    server[method](route.path, ...middlewares, async (req, res) => {
      try {
        await route.handler(context, req, res)
      } catch (error) {
        console.error("> Route error >", route, error)
        res.status(500).json({
          error: "Internal Server Error",
        })
      }
    })
  }
}
