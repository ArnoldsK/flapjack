import { RANK_MAX_LEVEL } from "../constants"
import { ExperienceLevelData } from "../models/Experience"
import { interpolate } from "./number"

export const getExperienceForLevel = (lvl: number): number => {
  // RuneScape uses factor of 4
  const factor = 104
  let a = 0

  for (let l = 1; l < lvl; l++) {
    a += Math.floor(l + 300 * Math.pow(2, l / 7))
  }

  return Math.floor(a / factor)
}

export const getExperienceLevelData = (exp: number): ExperienceLevelData => {
  // Default data
  const data: ExperienceLevelData = {
    exp,
    lvl: 1,
    min: getExperienceForLevel(1),
    max: getExperienceForLevel(2),
    percent: 0,
  }

  const setExpData = (lvl: number, minExp: number, maxExp: number) => {
    data.lvl = lvl
    data.min = minExp
    data.max = maxExp
    data.percent = Math.floor(interpolate(exp, minExp, maxExp, 0, 100))
  }

  for (let lvl = 1; lvl <= RANK_MAX_LEVEL; lvl++) {
    const lvlExp = getExperienceForLevel(lvl)

    // If level 1
    if (lvl === 1 && exp < data.max) {
      // Use default
      break
    }

    if (exp < lvlExp) {
      setExpData(lvl, getExperienceForLevel(lvl - 1), lvlExp)
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
