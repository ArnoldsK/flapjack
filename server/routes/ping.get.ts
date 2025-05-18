import { createRoute } from "~/server/utils/routes"

export default createRoute({
  path: "/ping",
  handler: async (context, _req, res) => {
    res.status(200)
    res.send(
      context.client.user
        ? `${context.client.user.displayName} is alive!`
        : "ERROR",
    )
  },
})
