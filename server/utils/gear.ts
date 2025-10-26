import { OsrsItemData, OsrsItemStats } from "~/types/osrs"

export const getCombinedItemStats = (items: OsrsItemData[]): OsrsItemStats => {
  const stats = {
    meleeAttack: 0,
    magicAttack: 0,
    rangedAttack: 0,
    meleeDefence: 0,
    magicDefence: 0,
    rangedDefence: 0,
    meleeStrength: 0,
    rangedStrength: 0,
    magicStrength: 0,
    speed: 0,
  } satisfies OsrsItemStats

  for (const stat of Object.keys(stats)) {
    for (const item of items) {
      const value = item[stat as keyof typeof item]

      stats[stat as keyof typeof stats] += value as number
    }
  }

  if (!stats.speed) {
    // Assume unarmed
    stats.speed = 4
  }

  return stats
}
