import { Role } from "discord.js"
import { discordIds } from "../../config"
import { Task } from "../../types/tasks"
import { BOOSTER_ICON_ROLE_PREFIX } from "../../constants"

export const removeNonBoosterIcons: Task = async (context) => {
  const nonBoosterMembers = context
    .guild()
    .members.cache.filter(
      (member) =>
        !member.user.bot &&
        !member.roles.cache.has(discordIds.roles.nitroBooster),
    )

  const rolesToRemove: Role[] = []

  for (const member of nonBoosterMembers.values()) {
    const role = member.roles.cache.find((role) =>
      role.name.startsWith(BOOSTER_ICON_ROLE_PREFIX),
    )
    if (role) {
      rolesToRemove.push(role)
    }
  }

  if (rolesToRemove.length) {
    await Promise.all(rolesToRemove.map((role) => role.delete()))
  }
}
