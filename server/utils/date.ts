import dayjs, { ManipulateType } from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import relativeTime from "dayjs/plugin/relativeTime"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

dayjs.extend(relativeTime)
dayjs.extend(isSameOrAfter)
dayjs.extend(utc)
dayjs.extend(timezone)

export { default as d } from "dayjs"

const DAYS_UNITS = new Set<ManipulateType>([
  "second",
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "year",
])

const isValidUnit = (unit: string): unit is ManipulateType => {
  unit = unit.toLowerCase()
  if (unit.endsWith("s")) {
    unit = unit.slice(0, -1)
  }
  return DAYS_UNITS.has(unit as ManipulateType)
}

/**
 * Parses input like "5 week" or "1 days" to dayjs object
 */
export const dSubtractRelative = (input: string): dayjs.Dayjs | null => {
  const parts = input.trim().split(/\s+/)
  if (parts.length !== 2) {
    return null
  }

  const [amountStr, unit] = parts
  const amount = Number(amountStr)

  if (!Number.isFinite(amount) || amount <= 0) {
    return null
  }

  if (!isValidUnit(unit)) {
    return null
  }

  return dayjs().subtract(amount, unit)
}
