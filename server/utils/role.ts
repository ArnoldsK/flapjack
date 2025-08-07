import {
  Guild,
  GuildMember,
  HexColorString,
  REST,
  Role,
  RoleCreateOptions,
  Routes,
} from "discord.js"

import { BOOSTER_ICON_ROLE_PREFIX, COLOR_ROLE_PREFIX } from "~/constants"
import { appConfig } from "~/server/config"
import { hexToDecimal } from "~/server/utils/color"

export const getClientRole = (guild: Guild): Role => {
  return guild.members.me!.roles.cache.find((role) => role.managed)!
}

export const getOrCreateRole = async (
  guild: Guild,
  options: Omit<RoleCreateOptions, "name"> & {
    name: string
    secondaryColor?: HexColorString | null
  },
): Promise<Role> => {
  const clientRole = getClientRole(guild)

  let role = guild.roles.cache.find(({ name }) => name === options.name)
  if (!role) {
    role = await guild.roles.create({
      position: clientRole.position,
      permissions: [],
      ...options,
    })
  }

  if (options.secondaryColor !== undefined) {
    // Update the role via api to have the gradient
    // TODO: Remove this when discord.js supports it
    const rest = new REST({ version: "10" }).setToken(appConfig.discord.token)

    await rest.patch(Routes.guildRole(guild.id, role.id), {
      body: {
        colors: {
          primary_color: hexToDecimal(role.hexColor),
          secondary_color: options.secondaryColor
            ? hexToDecimal(options.secondaryColor)
            : null,
          tertiary_color: null,
        },
      },
    })
  }

  return role
}

export const getMemberColorRole = (member: GuildMember): Role | undefined =>
  member.roles.cache.find(({ name }) => name.startsWith(COLOR_ROLE_PREFIX))

export const getMemberBoosterIconRole = (
  member: GuildMember,
): Role | undefined =>
  member.roles.cache.find(({ name }) =>
    name.startsWith(BOOSTER_ICON_ROLE_PREFIX),
  )

export const getMemberBoosterIconRoleName = (member: GuildMember): string =>
  `${BOOSTER_ICON_ROLE_PREFIX}${member.id.slice(0, 4)}`

/**
 * Delete the role if it has no members
 */
export const purgeRole = async (role: Role) => {
  if (role.members.size > 0) return
  await role.delete()
}

export const setMemberColorRole = async (
  member: GuildMember,
  [color1, color2]: [HexColorString, HexColorString | null],
): Promise<Role> => {
  const oldRole = getMemberColorRole(member)
  if (oldRole) {
    await member.roles.remove(oldRole)
    await purgeRole(oldRole)
  }

  const parseName = (color: HexColorString) =>
    color.replace("#", "").replace("000000", "000001").toUpperCase()

  const role = await getOrCreateRole(member.guild, {
    name:
      COLOR_ROLE_PREFIX +
      parseName(color1) +
      (color2 ? `-${parseName(color2)}` : ""),
    color: color1,
    secondaryColor: color2 ?? null,
  })
  await member.roles.add(role)

  return role
}
