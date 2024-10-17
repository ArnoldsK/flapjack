import { RANK_MAX_LEVEL } from "../constants"
import { RankLevelData } from "../types/experience"
import { interpolate } from "./number"

export const getExpRequiredForLevel = (lvl: number): number => {
  // Runescape uses factor of 4
  const factor = 104
  let a = 0

  for (let l = 1; l < lvl; l++) {
    a += Math.floor(l + 300 * Math.pow(2, l / 7))
  }

  return Math.floor(a / factor)
}

export const getExpRankLevelData = (exp: number): RankLevelData => {
  const data: RankLevelData = {
    exp,
    lvl: 1,
    min: getExpRequiredForLevel(1),
    max: getExpRequiredForLevel(2),
    percent: 0,
  }

  const setExpData = (lvl: number, minExp: number, maxExp: number) => {
    data.lvl = lvl
    data.min = minExp
    data.max = maxExp
    data.percent = Math.floor(interpolate(exp, minExp, maxExp, 0, 100))
  }

  for (let lvl = 1; lvl <= RANK_MAX_LEVEL; lvl++) {
    const lvlExp = getExpRequiredForLevel(lvl)

    // If level 1
    if (lvl === 1 && exp < data.max) {
      // Use default
      break
    }

    if (exp < lvlExp) {
      setExpData(lvl, getExpRequiredForLevel(lvl - 1), lvlExp)
      break
    }

    // In case max level reached
    if (lvl === RANK_MAX_LEVEL && exp >= lvlExp) {
      setExpData(RANK_MAX_LEVEL, lvlExp, lvlExp)
      break
    }
  }

  return data
}
