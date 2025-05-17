import { Collection, Events, Role } from "discord.js"

import { createEvent } from "../utils/event"
import { RolesModel } from "../db/model/Roles"

export default createEvent(
  Events.GuildMemberUpdate,
  { productionOnly: true },
  async (_context, oldMember, member) => {
    if (member.user.bot) return

    const oldRoleIds = mapRoleIds(oldMember.roles.cache)
    const newRoleIds = mapRoleIds(member.roles.cache)

    // No roles change
    if (oldRoleIds === newRoleIds) return

    // Upsert
    const model = new RolesModel(member)
    await model.setRoleIds(newRoleIds)
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
