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

export class GearDuel {
  private readonly ATTACK_LEVEL = 99
  private readonly STRENGTH_LEVEL = 99
  private readonly DEFENCE_LEVEL = 99
  private readonly STARTING_HP = 99
  private readonly BASE_MAGIC_MAX_HIT = 12 // 20 if high
  // private readonly TICKS_TO_APS = 0.6

  private playerName: string
  private enemyName: string

  private playerAttackType: "melee" | "magic" | "ranged"
  private enemyAttackType: "melee" | "magic" | "ranged"

  private playerMaxHit: number
  private enemyMaxHit: number

  private playerHitChance: number
  private enemyHitChance: number

  private playerSpeed: number
  private enemySpeed: number

  constructor({
    player,
    enemy,
  }: {
    player: {
      name: string
      stats: OsrsItemStats
    }
    enemy: {
      name: string
      stats: OsrsItemStats
    }
  }) {
    this.playerName = player.name
    this.enemyName = enemy.name

    // Player (Attacker) vs Enemy (Defender)
    this.playerAttackType = this.#getAttackType(player.stats).type
    this.playerMaxHit = this.#getMaxHit(player.stats, this.playerAttackType)
    const playerAttackRoll = this.#getAttackRoll(player.stats)
    const enemyDefenceRoll = this.#getDefenceRoll(
      enemy.stats,
      this.playerAttackType,
    )
    this.playerHitChance = this.#getHitChance(
      playerAttackRoll,
      enemyDefenceRoll,
    )
    this.playerSpeed = player.stats.speed ?? 4

    // Enemy (Attacker) vs Player (Defender) - For a full duel
    this.enemyAttackType = this.#getAttackType(enemy.stats).type
    this.enemyMaxHit = this.#getMaxHit(enemy.stats, this.enemyAttackType)
    const enemyAttackRoll = this.#getAttackRoll(enemy.stats)
    const playerDefenceRoll = this.#getDefenceRoll(
      player.stats,
      this.enemyAttackType,
    )
    this.enemyHitChance = this.#getHitChance(enemyAttackRoll, playerDefenceRoll)
    this.enemySpeed = enemy.stats.speed ?? 4

    this.simulateDuel()
  }

  simulateDuel() {
    const actionLog: string[] = []

    let playerHp = this.STARTING_HP
    let enemyHp = this.STARTING_HP
    let playerNextAttackTick = 0
    let enemyNextAttackTick = 0
    let currentTick = 0
    // let duelTimeTicks = 0

    while (playerHp > 0 && enemyHp > 0) {
      currentTick++

      // --- Player's Turn to Attack ---
      if (currentTick >= playerNextAttackTick) {
        const result = this.#rollDamage(this.playerMaxHit, this.playerHitChance)
        const type = this.playerAttackType

        if (result.hit) {
          enemyHp = Math.max(0, enemyHp - result.damage)
          actionLog.push(
            `${this.playerName} hits for ${result.damage} ${type} damage (${enemyHp} HP)`,
          )
        } else {
          actionLog.push(`${this.playerName} misses.`)
        }

        playerNextAttackTick = currentTick + this.playerSpeed
      }

      // --- Enemy's Turn to Attack ---
      if (enemyHp > 0 && currentTick >= enemyNextAttackTick) {
        const result = this.#rollDamage(this.enemyMaxHit, this.enemyHitChance)
        const type = this.enemyAttackType

        if (result.hit) {
          playerHp = Math.max(0, playerHp - result.damage)
          actionLog.push(
            `${this.enemyName} hits for ${result.damage} ${type} damage (${playerHp} HP)`,
          )
        } else {
          actionLog.push(`${this.enemyName} misses.`)
        }

        enemyNextAttackTick = currentTick + this.enemySpeed
      }

      // duelTimeTicks = currentTick

      if (currentTick > 10_000) {
        actionLog.push(
          "[ERROR] Simulation ran too long (10,000 ticks). Stopping.",
        )
        break
      }
    }

    // --- Final Results Logging ---
    // const duelTimeSeconds = (duelTimeTicks * this.TICKS_TO_APS).toFixed(1)

    let result: string
    if (playerHp > enemyHp) {
      result = `${this.playerName} wins with ${playerHp} HP! 👑`
    } else if (enemyHp > playerHp) {
      result = `${this.enemyName} wins with ${enemyHp} HP! 💀`
    } else {
      result = "Draw! Both combatants fell simultaneously. ⚔️"
    }

    return { result, actionLog }
  }

  #getAttackType(stats: OsrsItemStats): {
    type: "melee" | "magic" | "ranged"
    value: number
  } {
    const types = {
      melee: stats.meleeAttack,
      magic: stats.magicAttack,
      ranged: stats.rangedAttack,
    }

    let highestAttack = -Infinity
    let attackType: keyof typeof types = "melee"

    for (const [type, bonus] of Object.entries(types)) {
      if (bonus !== 0 && bonus > highestAttack) {
        highestAttack = bonus
        attackType = type as keyof typeof types
      }
    }

    return {
      type: attackType,
      value: highestAttack,
    }
  }

  #getMaxHit(
    stats: OsrsItemStats,
    attackType: "melee" | "magic" | "ranged",
  ): number {
    let maxHit: number

    if (attackType === "magic") {
      const effectiveMagicLevel = this.ATTACK_LEVEL + 8

      // This is the common formula for Magic Max Hit (when base spell damage is known):
      // Magic Max Hit = BaseSpellDamage + (EffectiveLevel / 10) + 1 + MaxBonus
      // However, since we don't have a spell, we use the gear's magicStrength % to boost a BASE value.

      // Magic Max Hit = (BASE_MAX_HIT + (Mage Level/10) + 1) * (1 + (MagicStrengthBonus / 100))

      const baseDamage = Math.floor(
        this.BASE_MAGIC_MAX_HIT + effectiveMagicLevel / 10 + 1,
      )

      // magicStrength is a percentage (e.g., 20 for 20%)
      const strengthMultiplier = 1 + stats.magicStrength / 100

      maxHit = Math.floor(baseDamage * strengthMultiplier)
    } else {
      // MELEE/RANGED DAMAGE FORMULA
      let equipmentStrBonus: number
      switch (attackType) {
        case "melee": {
          equipmentStrBonus = stats.meleeStrength
          break
        }
        case "ranged": {
          equipmentStrBonus = stats.rangedStrength
          break
        }
        default: {
          // Should not happen
          equipmentStrBonus = 0
        }
      }

      const effectiveStrength = this.STRENGTH_LEVEL + 8 // Simplified

      maxHit = Math.floor(
        0.5 + (effectiveStrength * (equipmentStrBonus + 64)) / 640,
      )
    }

    return maxHit
  }

  #getAttackRoll(stats: OsrsItemStats): number {
    const equipmentAtkBonus = this.#getAttackType(stats).value

    return Math.floor((this.ATTACK_LEVEL + 8) * (equipmentAtkBonus + 64))
  }

  #getDefenceRoll(
    stats: OsrsItemStats,
    opposingAttackType: "melee" | "magic" | "ranged",
  ): number {
    let equipmentDefBonus: number
    switch (opposingAttackType) {
      case "melee": {
        equipmentDefBonus = stats.meleeDefence
        break
      }
      case "magic": {
        equipmentDefBonus = stats.magicDefence
        break
      }
      case "ranged": {
        equipmentDefBonus = stats.rangedDefence
        break
      }
    }

    return Math.floor((this.DEFENCE_LEVEL + 8) * (equipmentDefBonus + 64))
  }

  #getHitChance(attackRoll: number, defenceRoll: number): number {
    return attackRoll > defenceRoll
      ? // Attacker has a higher max roll
        1 - (defenceRoll + 2) / (2 * (attackRoll + 1))
      : // Defender has a higher or equal max roll
        attackRoll / (2 * (defenceRoll + 1))
  }

  #rollDamage(
    maxHit: number,
    hitChance: number,
  ): { damage: number; hit: boolean } {
    if (Math.random() < hitChance) {
      return {
        damage: Math.floor(Math.random() * (maxHit + 1)),
        hit: true,
      }
    }
    return { damage: 0, hit: false }
  }
}
