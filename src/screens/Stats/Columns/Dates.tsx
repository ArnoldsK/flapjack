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

  // #############################################################################
  // Totals by month
  // #############################################################################
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
  // Combined trend
  // #############################################################################
  const yearMonthTrend = useMemo(() => {
    if (currentYearMonth !== YEAR_MONTH_ALL) {
      return {
        entries: [],
        max: 0,
      }
    }

    const totalsPerYearMonth = new Map<string, number>([])

    for (const item of messagesPerDay) {
      const yearMonth = d(item.dateString).format("YYYY MMMM")

      totalsPerYearMonth.set(
        yearMonth,
        (totalsPerYearMonth.get(yearMonth) ?? 0) + item.messageCount,
      )
    }

    return {
      entries: [...totalsPerYearMonth.entries()],
      max: Math.max(...totalsPerYearMonth.values()),
    }
  }, [currentYearMonth, messagesPerDay])

  // #############################################################################
  // Render
  // #############################################################################
  return (
    <S.StatColumn>
      {currentYearMonth === YEAR_MONTH_ALL ? (
        <>
          <S.Stat>
            <S.GraphWrap>
              {yearMonthTrend.entries.map(([yearMonth, total]) => (
                <S.GraphBar
                  key={yearMonth}
                  title={String(total)}
                  style={getGraphBarStyle({
                    heightPrc: (total / yearMonthTrend.max) * 100,
                  })}
                >
                  <S.GraphBarLabel>
                    {/* {yearMonth.split(" ").at(1)?.slice(0, 3)} */}
                    {yearMonth.slice(0, 8)}
                  </S.GraphBarLabel>
                </S.GraphBar>
              ))}
            </S.GraphWrap>
          </S.Stat>
          <S.Stat>
            <S.StatItemsWrap>
              {commands.map((command) => (
                <S.StatItem key={command.name}>
                  <S.CountBadge>{command.count}</S.CountBadge>
                  <S.StatText>/{command.name}</S.StatText>
                </S.StatItem>
              ))}
            </S.StatItemsWrap>
          </S.Stat>
        </>
      ) : (
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
                title={String(total)}
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
