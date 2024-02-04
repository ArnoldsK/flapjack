import moment from "moment"

export const formatDays = (days: number): string => {
  moment.relativeTimeRounding(Math.floor)

  return moment().add(days, "days").fromNow()
}
