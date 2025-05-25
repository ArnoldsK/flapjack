import { Events } from "discord.js"

import { RolesEntity } from "~/server/db/entity/Roles"
import { createEvent } from "~/server/utils/event"

export default createEvent(
  Events.ClientReady,
  { productionOnly: true },
  async (context) => {
    const guild = context.guild()

    const memberRoleIds = guild.members.cache
      .filter((member) => !member.user.bot)
      .map(({ id, roles }) => ({
        userId: id,
        roleIds: roles.cache
          .map(({ id }) => id)
          // Exclude @everyone role
          .filter((id) => id !== guild.id),
      }))
    if (memberRoleIds.length === 0) return

    await context.em().upsertMany(RolesEntity, memberRoleIds)
  },
)
