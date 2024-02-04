import {
  Guild,
  GuildMember,
  HexColorString,
  Role,
  RoleCreateOptions,
} from "discord.js"
import { COLOR_ROLE_PREFIX } from "../constants"

export const getClientRole = (guild: Guild): Role => {
  return guild.members.me!.roles.cache.find((role) => role.managed)!
}

export const getOrCreateRole = async (
  guild: Guild,
  options: Omit<RoleCreateOptions, "name"> & { name: string },
): Promise<Role> => {
  const clientRole = getClientRole(guild)

  let role = guild.roles.cache.find(({ name }) => name === options.name)
  if (!role) {
    role = await guild.roles.create({
      position: clientRole.position,
      ...options,
    })
  }

  return role
}

export const getMemberColorRole = (member: GuildMember): Role | undefined =>
  member.roles.cache.find(({ name }) => name.startsWith(COLOR_ROLE_PREFIX))

export const setMemberColorRole = async (
  member: GuildMember,
  color: HexColorString,
) => {
  const oldRole = getMemberColorRole(member)
  if (oldRole) {
    await member.roles.remove(oldRole)
  }

  const role = await getOrCreateRole(member.guild, {
    name:
      COLOR_ROLE_PREFIX +
      color.replace("#", "").replace("000000", "000001").toUpperCase(),
    color,
  })
  await member.roles.add(role)
}
