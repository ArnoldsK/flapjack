import { ChannelType } from "discord-api-types/v10"
import { GetServerSideProps } from "next"
import absoluteUrl from "next-absolute-url"
import { useCallback, useEffect, useMemo, useState } from "react"

import TextIcon from "./icons/text.svg"
import ThreadIcon from "./icons/thread.svg"
import * as S from "./styles"

import { d } from "~/server/utils/date"
import { Page } from "~/src/components/Page"
import { ApiStats, ApiStatsDay } from "~/types/api"

interface StatsScreenProps {
  stats: ApiStats
}

const YEAR_MONTH_ALL = "all-year-months"
const YEAR_MONTH_FORMAT = "YYYY MMMM"
const DATE_STRING_FORMAT = "YYYY-MM-DD"

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
    setCurrentYearMonth(yearMonths.at(-1))
  }, [yearMonths])

  // #############################################################################
  // Second level separation
  // #############################################################################
  const currentMonthStats = useMemo(() => {
    return currentYearMonth === YEAR_MONTH_ALL
      ? messagesPerDay
      : messagesPerDay.filter(
          (item) =>
            d(item.dateString).format(YEAR_MONTH_FORMAT) === currentYearMonth,
        )
  }, [currentYearMonth, messagesPerDay])

  const currentMonthPastDates = useMemo((): number[] => {
    const firstStat = currentMonthStats.at(0)
    if (!firstStat) {
      return []
    }

    const firstDate = d(firstStat.dateString).date()

    return Array.from({ length: firstDate - 1 }, (_, i) => i + 1)
  }, [currentMonthStats])

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
      d(item.dateString).format(DATE_STRING_FORMAT),
    )
  }, [currentMonthStats])

  const [currentDateString, setCurrentDateString] = useState<string>()

  // Set as current if possible, otherwise first
  useEffect(() => {
    const nowDateString = d().format(DATE_STRING_FORMAT)
    const dateString = dateStrings.find((el) => el === nowDateString)

    setCurrentDateString(dateString ?? dateStrings.at(-1))
  }, [dateStrings])

  // #############################################################################
  // Current stats
  // #############################################################################
  const currentStats = useMemo(() => {
    if (currentYearMonth === YEAR_MONTH_ALL) {
      const mergeTopEntities = <T extends { id: string; messageCount: number }>(
        accList: T[],
        newList: T[],
      ): T[] => {
        const map = new Map<string, T>()

        for (const item of accList) {
          map.set(item.id, { ...item })
        }

        for (const item of newList) {
          const existing = map.get(item.id)
          if (existing) {
            existing.messageCount += item.messageCount
          } else {
            map.set(item.id, { ...item })
          }
        }

        return [...map.values()].sort((a, b) => b.messageCount - a.messageCount)
      }

      return messagesPerDay.reduce<ApiStatsDay>(
        (acc, item) => ({
          ...acc,
          messageCount: acc.messageCount + item.messageCount,
          topChannels: mergeTopEntities(acc.topChannels, item.topChannels),
          topUsers: mergeTopEntities(acc.topUsers, item.topUsers),
        }),
        {
          dateString: YEAR_MONTH_ALL,
          messageCount: 0,
          topChannels: [],
          topUsers: [],
        },
      )
    }

    return messagesPerDay.find((item) => item.dateString === currentDateString)
  }, [currentDateString, currentYearMonth, messagesPerDay])

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
  // Channel icon
  // #############################################################################
  const getChannelIcon = useCallback((type: ChannelType) => {
    switch (type) {
      case ChannelType.PublicThread:
      case ChannelType.PrivateThread: {
        return <ThreadIcon />
      }
      default: {
        return <TextIcon />
      }
    }
  }, [])

  // #############################################################################
  // Render
  // #############################################################################
  return (
    <Page title="Stats">
      {yearMonths.length > 0 && (
        <S.Months>
          {yearMonths.map((yearMonth) => (
            <S.Month
              key={yearMonth}
              active={currentYearMonth === yearMonth}
              onClick={() => setCurrentYearMonth(yearMonth)}
            >
              {yearMonth}
            </S.Month>
          ))}
          <S.Month
            active={currentYearMonth === YEAR_MONTH_ALL}
            onClick={() => setCurrentYearMonth(YEAR_MONTH_ALL)}
          >
            Combined
          </S.Month>
        </S.Months>
      )}

      {currentStats && (
        <S.Stats>
          <S.StatColumn>
            {currentYearMonth !== YEAR_MONTH_ALL && (
              <S.Stat>
                <S.CalendarWrap>
                  {currentMonthPastDates.map((date) => (
                    <S.Day key={date} $disabled>
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
                  {currentMonthFutureDates.map((date) => (
                    <S.Day key={date} $disabled>
                      {date}
                    </S.Day>
                  ))}
                </S.CalendarWrap>
                <S.GraphWrap>
                  {currentMonthPastDates.map((date) => (
                    <S.GraphBar key={date} $heightPrc={0} />
                  ))}
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
                  {currentMonthFutureDates.map((date) => (
                    <S.GraphBar key={date} $heightPrc={0} />
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
          <S.Stat>
            <S.StatItemsWrap>
              {currentStats.topChannels.map((channel) => (
                <S.StatItem key={channel.id} $muted={!channel.name}>
                  <S.CountBadge>{channel.messageCount}</S.CountBadge>
                  <S.StatIcon>{getChannelIcon(channel.type)}</S.StatIcon>
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
