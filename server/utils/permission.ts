import type { GuildMember } from "discord.js"
import { PermissionFlagsBits } from "discord.js"
import { DISCORD_IDS } from "../../constants"

export type PermissionType = "allow" | "deny" | "either"

export interface Permission {
  type: PermissionType
  permissions: bigint[]
}

export const PermissionFlags = {
  ...PermissionFlagsBits,
  /**
   * Custom permission flag
   * Requires custom validation as it's not a part of Discord flags
   */
  NitroBooster: BigInt(1000),
  ClientOwner: BigInt(1010),
}

export const getPermissionFlagName = (permission: bigint): string | null => {
  switch (permission) {
    case PermissionFlags.Administrator:
      return "Admin"
    case PermissionFlags.NitroBooster:
      return "Booster"
    default:
      return "Moderator"
  }
}

/**
 * Helper function just to return proper types
 */
export const permission = (data: Permission): Permission => data

export const memberHasPermission = (
  member: GuildMember,
  { type, permissions }: Permission,
): boolean => {
  const customPermissions: bigint[] = [
    PermissionFlags.ClientOwner,
    PermissionFlags.NitroBooster,
  ]

  const isCustom = (permission: bigint) =>
    customPermissions.includes(permission)

  const validateCustom = (permission: bigint): boolean => {
    switch (permission) {
      case PermissionFlags.ClientOwner:
        return member.id === DISCORD_IDS.users.owner

      case PermissionFlags.NitroBooster:
        return member.roles.cache.has(DISCORD_IDS.roles.nitroBooster)

      default:
        return true
    }
  }

  // Always allow things for client owner
  if (validateCustom(PermissionFlags.ClientOwner)) return true

  // Always allow things for administrators unless given client owner permission
  if (
    !permissions.includes(PermissionFlags.ClientOwner) &&
    member.permissions.has(PermissionFlags.Administrator)
  )
    return true

  // Check given permissions
  switch (type) {
    case "allow":
      if (!permissions.length) {
        // Always deny
        return false
      } else {
        // Check if all match
        for (const permission of permissions) {
          if (isCustom(permission)) {
            if (!validateCustom(permission)) {
              return false
            }
          } else if (!member.permissions.has(permission)) {
            return false
          }
        }

        // Otherwise allow
        return true
      }

    case "deny":
      if (!permissions.length) {
        // Always allow
        return true
      } else {
        // Check if none match
        for (const permission of permissions) {
          if (isCustom(permission)) {
            if (validateCustom(permission)) {
              return false
            }
          } else if (member.permissions.has(permission)) {
            return false
          }
        }

        // Otherwise allow
        return true
      }

    case "either":
      // Check if has either
      for (const permission of permissions) {
        if (isCustom(permission)) {
          if (validateCustom(permission)) {
            return true
          }
        } else if (member.permissions.has(permission)) {
          return true
        }
      }

      // Otherwise deny
      return false
  }
}
