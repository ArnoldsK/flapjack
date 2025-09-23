import dayjs from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import relativeTime from "dayjs/plugin/relativeTime"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

dayjs.extend(relativeTime)
dayjs.extend(isSameOrAfter)
dayjs.extend(utc)
dayjs.extend(timezone)

export { default as d } from "dayjs"
