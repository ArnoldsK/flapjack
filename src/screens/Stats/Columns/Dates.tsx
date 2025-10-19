import { CSSProperties, ReactNode, useMemo, useState } from "react"

import * as S from "../styles"

import { d } from "~/server/utils/date"
import { YEAR_MONTH_ALL } from "~/src/screens/Stats/constants"
import { ApiStats, ApiStatsDay } from "~/types/api"

interface DatesColumnProps {
  stats: ApiStats
  currentMonthStats: ApiStatsDay[]
  dateStrings: string[]
  currentDateString: string | undefined
  setCurrentDateString: (dateString: string | undefined) => void
  currentYearMonth: string | undefined
  currentMonthPastDates: ReactNode[]
  currentMonthFutureDates: ReactNode[]
}

export const DatesColumn = ({
  stats,
  currentMonthStats,
  dateStrings,
  currentDateString,
  setCurrentDateString,
  currentYearMonth,
  currentMonthPastDates,
  currentMonthFutureDates,
}: DatesColumnProps) => {
  const { messagesPerDay, commands } = stats

  // #############################################################################
  // Current hover
  // #############################################################################
  const [currentHoverDateString, setCurrentHoverDateString] = useState<
    string | null
  >(null)

  const currentMonthTotals = useMemo(() => {
    const absoluteMax = Math.max(
      ...messagesPerDay.map((item) => item.messageCount),
    )
    const perDateTotals = currentMonthStats.map((item) => ({
      dateString: item.dateString,
      total: item.messageCount,
    }))

    return {
      max: absoluteMax,
      totals: perDateTotals,
    }
  }, [currentMonthStats, messagesPerDay])

  // #############################################################################
  // Render
  // #############################################################################
  return (
    <S.StatColumn>
      {currentYearMonth !== YEAR_MONTH_ALL && (
        <S.Stat>
          <S.CalendarWrap>
            {currentMonthPastDates.map((date, i) => (
              <S.Day key={i} $disabled>
                {date}
              </S.Day>
            ))}
            {dateStrings.map((dateString) => (
              <S.Day
                key={dateString}
                $active={dateString === currentDateString}
                $hover={dateString === currentHoverDateString}
                onClick={() => setCurrentDateString(dateString)}
                onMouseEnter={() => setCurrentHoverDateString(dateString)}
                onMouseLeave={() => setCurrentHoverDateString(null)}
              >
                {d(dateString).format("D")}
              </S.Day>
            ))}
            {currentMonthFutureDates.map((date, i) => (
              <S.Day key={i} $disabled>
                {date}
              </S.Day>
            ))}
          </S.CalendarWrap>
          <S.GraphWrap>
            {currentMonthPastDates.map(
              (date, i) =>
                typeof date === "number" && (
                  <S.GraphBar
                    key={i}
                    style={getGraphBarStyle({ heightPrc: 0 })}
                  />
                ),
            )}
            {currentMonthTotals.totals.map(({ total, dateString }) => (
              <S.GraphBar
                key={dateString}
                $active={dateString === currentDateString}
                onClick={() => setCurrentDateString(dateString)}
                onMouseEnter={() => setCurrentHoverDateString(dateString)}
                onMouseLeave={() => setCurrentHoverDateString(null)}
                style={getGraphBarStyle({
                  heightPrc: (total / currentMonthTotals.max) * 100,
                  hover: dateString === currentHoverDateString,
                })}
              />
            ))}
            {currentMonthFutureDates.map((_, i) => (
              <S.GraphBar key={i} style={getGraphBarStyle({ heightPrc: 0 })} />
            ))}
          </S.GraphWrap>
        </S.Stat>
      )}
      <S.Stat>
        <S.CollapseCheckbox type="checkbox" />
        <S.StatItemsWrap>
          {commands.map((command) => (
            <S.StatItem key={command.name}>
              <S.CountBadge>{command.count}</S.CountBadge>
              <S.StatText>/{command.name}</S.StatText>
            </S.StatItem>
          ))}
        </S.StatItemsWrap>
      </S.Stat>
    </S.StatColumn>
  )
}

const getGraphBarStyle = ({
  heightPrc,
  hover,
}: {
  heightPrc: number
  hover?: boolean
}) => {
  return {
    "--bar-background": hover ? "#b492d488" : "#b492d433",
    "--bar-height": `${heightPrc}%`,
  } as CSSProperties
}
