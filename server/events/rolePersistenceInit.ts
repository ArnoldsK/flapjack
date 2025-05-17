import { Events } from "discord.js"

import { createEvent } from "../utils/event"
import { RolesEntity } from "../db/entity/Roles"

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
    if (!memberRoleIds.length) return

    await RolesEntity.createQueryBuilder()
      .insert()
      .values(memberRoleIds)
      .orUpdate(["roleIds"], "userId")
      .execute()
  },
)
