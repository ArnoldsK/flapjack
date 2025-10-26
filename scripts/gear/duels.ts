import { GearDuel } from "~/server/utils/gear"
import { OsrsItemStats } from "~/types/osrs"

const run = async () => {
  const playerStats: OsrsItemStats = {
    meleeAttack: 17,
    magicAttack: 0,
    rangedAttack: 0,
    meleeDefence: 0,
    magicDefence: 0,
    rangedDefence: 0,
    meleeStrength: 44,
    rangedStrength: 0,
    magicStrength: 0,
    speed: 4,
  }

  const enemyStats: OsrsItemStats = {
    meleeAttack: 0,
    magicAttack: -30,
    rangedAttack: -15,
    meleeDefence: 78,
    magicDefence: -6,
    rangedDefence: 80,
    meleeStrength: 0,
    rangedStrength: 0,
    magicStrength: 0,
    speed: 4,
  }

  const duel = new GearDuel({
    player: {
      name: "Greed",
      stats: playerStats,
    },
    enemy: {
      name: "Ramzes",
      stats: enemyStats,
    },
  })
  const { actionLog } = duel.simulateDuel()

  for (const log of actionLog) {
    console.log(log)
  }
}

run()
