import { GetServerSideProps } from "next"

import { ApiStats } from "../../../types/api"
import { Page } from "../../components/Page"
import * as S from "./styles"
import absoluteUrl from "next-absolute-url"
import { useEffect, useMemo, useState } from "react"
import { d } from "../../../server/utils/date"

interface StatsScreenProps {
  stats: ApiStats
}

const yearMonthFormat = "YYYY MMMM"
const dateStringFormat = "YYYY-MM-DD"

const formatChannelName = (name: string) => {
  return name.replace("╰", "")
}

export const StatsScreen = ({ stats }: StatsScreenProps) => {
  const { messagesPerDay, commands } = stats

  // #############################################################################
  // Top level separation
  // #############################################################################
  const yearMonths = useMemo(
    () => [
      ...new Set(
        messagesPerDay.map((item) => d(item.dateString).format("YYYY MMMM")),
      ),
    ],
    [messagesPerDay],
  )

  const [currentYearMonth, setCurrentYearMonth] = useState<string>()

  // Set as latest
  useEffect(() => {
    setCurrentYearMonth(yearMonths[yearMonths.length - 1])
  }, [yearMonths])

  // #############################################################################
  // Second level separation
  // #############################################################################
  const currentMonthStats = useMemo(() => {
    return messagesPerDay.filter(
      (item) => d(item.dateString).format(yearMonthFormat) === currentYearMonth,
    )
  }, [currentYearMonth, messagesPerDay])

  const currentMonthFutureDates = useMemo((): number[] => {
    const lastStat = currentMonthStats.at(-1)
    if (!lastStat) {
      return []
    }

    const lastDate = d(lastStat.dateString).date()
    const daysInMonth = d(lastStat.dateString).daysInMonth()

    return Array.from(
      { length: daysInMonth - lastDate },
      (_, i) => lastDate + i + 1,
    )
  }, [currentMonthStats])

  const dateStrings = useMemo(() => {
    return currentMonthStats.map((item) =>
      d(item.dateString).format(dateStringFormat),
    )
  }, [currentMonthStats])

  const [currentDateString, setCurrentDateString] = useState<string>()

  // Set as current if possible, otherwise first
  useEffect(() => {
    const nowDateString = d().format(dateStringFormat)
    const dateString = dateStrings.find((el) => el === nowDateString)

    setCurrentDateString(dateString ?? dateStrings[dateStrings.length - 1])
  }, [dateStrings])

  // #############################################################################
  // Current stats
  // #############################################################################
  const currentStats = useMemo(() => {
    return messagesPerDay.find((item) => item.dateString === currentDateString)
  }, [currentDateString, messagesPerDay])

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
  // Current hover
  // #############################################################################
  const [currentHoverDateString, setCurrentHoverDateString] = useState<
    string | null
  >(null)

  // #############################################################################
  // Render
  // #############################################################################
  return (
    <Page title="Stats">
      <S.Months>
        {yearMonths.map((yearMonth) => (
          <S.Month
            key={yearMonth}
            active={currentYearMonth === yearMonth}
            onClick={() => setCurrentYearMonth(yearMonth)}
          >
            <span>{yearMonth}</span>
          </S.Month>
        ))}
      </S.Months>

      {currentStats && (
        <S.Stats>
          <S.StatColumn>
            <S.Stat>
              <S.CalendarWrap>
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
                {currentMonthFutureDates.map((date) => (
                  <S.Day key={date} $disabled>
                    {date}
                  </S.Day>
                ))}
              </S.CalendarWrap>
              <S.GraphWrap>
                {currentMonthTotals.totals.map(({ total, dateString }) => (
                  <S.GraphBar
                    key={dateString}
                    $heightPrc={(total / currentMonthTotals.max) * 100}
                    $active={dateString === currentDateString}
                    $hover={dateString === currentHoverDateString}
                    onClick={() => setCurrentDateString(dateString)}
                    onMouseEnter={() => setCurrentHoverDateString(dateString)}
                    onMouseLeave={() => setCurrentHoverDateString(null)}
                  />
                ))}
              </S.GraphWrap>
            </S.Stat>
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
          <S.Stat>
            <S.StatItemsWrap>
              {currentStats.topChannels.map((channel) => (
                <S.StatItem key={channel.id} $muted={!channel.name}>
                  <S.CountBadge>{channel.messageCount}</S.CountBadge>
                  <S.StatText>
                    {formatChannelName(channel.name) || channel.id}
                  </S.StatText>
                </S.StatItem>
              ))}
            </S.StatItemsWrap>
          </S.Stat>
          <S.Stat>
            <S.StatItemsWrap>
              {currentStats.topUsers.map((user) => (
                <S.StatItem key={user.id} $muted={!user.displayName}>
                  <S.CountBadge>{user.messageCount}</S.CountBadge>
                  <S.StatText>{user.displayName || user.id}</S.StatText>
                </S.StatItem>
              ))}
            </S.StatItemsWrap>
          </S.Stat>
        </S.Stats>
      )}
    </Page>
  )
}

export const getServerSideProps: GetServerSideProps<StatsScreenProps> = async (
  ctx,
) => {
  const { origin } = absoluteUrl(ctx.req)
  const res = await fetch(`${origin}/api/stats`)
  const stats = await res.json()

  return {
    props: {
      stats,
    },
  }
}
