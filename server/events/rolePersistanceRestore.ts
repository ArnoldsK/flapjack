import { Events } from "discord.js"

import { RolesModel } from "~/server/db/model/Roles"
import { createEvent } from "~/server/utils/event"

export default createEvent(
  Events.GuildMemberAdd,
  { productionOnly: true },
  async (context, member) => {
    if (member.user.bot) return

    const model = new RolesModel(context)

    const savedRoleIds = await model.getRoleIds(member.id)
    if (savedRoleIds.length === 0) return

    const roles = member.guild.roles.cache.filter(({ id }) =>
      savedRoleIds.includes(id),
    )
    if (roles.size === 0) return

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
