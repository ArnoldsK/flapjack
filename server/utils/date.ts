import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"

dayjs.extend(relativeTime)
dayjs.extend(isSameOrAfter)

export { dayjs as d }
