import { Collection, Events, Role } from "discord.js"

import { RolesModel } from "~/server/db/model/Roles"
import { createEvent } from "~/server/utils/event"

export default createEvent(
  Events.GuildMemberUpdate,
  { productionOnly: true },
  async (context, oldMember, member) => {
    if (member.user.bot) return

    const oldRoleIds = mapRoleIds(oldMember.roles.cache)
    const newRoleIds = mapRoleIds(member.roles.cache)

    // No roles change
    if (oldRoleIds === newRoleIds) return

    // Upsert
    const model = new RolesModel(context)
    await model.setRoleIds(member.id, newRoleIds)
  },
)

const mapRoleIds = (roles: Collection<string, Role>): string[] => {
  const guild = roles.first()?.guild
  if (!guild) {
    return []
  }

  return (
    roles
      .map(({ id }) => id)
      // Exclude @everyone role
      .filter((id) => id !== guild.id)
      .sort((a, b) => a.localeCompare(b))
  )
}
