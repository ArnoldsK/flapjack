import { Events } from "discord.js"

import { createEvent } from "~/server/utils/event"
import { RolesModel } from "~/server/db/model/Roles"

export default createEvent(
  Events.GuildMemberAdd,
  { productionOnly: true },
  async (_context, member) => {
    if (member.user.bot) return

    const model = new RolesModel(member)

    const savedRoleIds = await model.getRoleIds()
    if (!savedRoleIds.length) return

    const roles = member.guild.roles.cache.filter(({ id }) =>
      savedRoleIds.includes(id),
    )
    if (!roles.size) return

    try {
      await member.roles.add(roles)
    } catch {
      const roleNames = roles.map(({ name }) => name).join(", ")
      console.error(
        `Failed to restore roles ${roleNames} for ${member.user.username}`,
      )
    }
  },
)
