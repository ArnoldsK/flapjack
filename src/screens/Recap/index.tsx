import absoluteUrl from "next-absolute-url"
import type { GetServerSideProps } from "next"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useWindowScroll } from "react-use"

import { Page } from "../../components/Page"
import { RECAP_CHANNEL_IDS } from "../../../constants"
import { RecapMessage } from "./Message"
import { MessagesByChannel, RecapScreenProps } from "./types"
import * as S from "./styles"

const CHANNEL_CLASS_NAME = "recap-channel"

export const Recap = ({ recap, membersData }: RecapScreenProps) => {
  // #############################################################################
  // Messages
  // #############################################################################
  const [messagesByChannel, setMessagesByChannel] = useState<
    MessagesByChannel[]
  >([])

  useEffect(() => {
    setMessagesByChannel(
      RECAP_CHANNEL_IDS.map((channelId): MessagesByChannel | null => {
        const messages = recap.messages
          .filter((el) => el.channel.id === channelId)
          .slice(0)
          .sort(
            (a, b) =>
              // More reactions first
              b.reactionCount - a.reactionCount ||
              // Older first
              Date.parse(a.createdAt as unknown as string) -
                Date.parse(b.createdAt as unknown as string),
          )
          .slice(0, 5)

        return messages.length
          ? {
              channel: messages[0].channel,
              messages,
            }
          : null
      }).filter((el): el is MessagesByChannel => !!el),
    )
  }, [recap.messages])

  // #############################################################################
  // Channels
  // #############################################################################
  const [activeChannelId, setActiveChannelId] = useState<string>()
  const { y: scrollY } = useWindowScroll()

  const channels = useMemo(() => {
    return messagesByChannel.map((el) => el.channel)
  }, [messagesByChannel])

  const activeChannelIndex = useMemo(() => {
    return activeChannelId
      ? channels.findIndex((el) => el.id === activeChannelId)
      : 0
  }, [activeChannelId, channels])

  useEffect(() => {
    setActiveChannelId(channels[0]?.id)
  }, [channels])

  useEffect(() => {
    const channelEls = [
      ...document.querySelectorAll(`.${CHANNEL_CLASS_NAME}`),
    ] as HTMLDivElement[]

    const activeChannelEl = channelEls.reverse().find((el) => {
      const bb = el.getBoundingClientRect()

      return bb.top < window.innerHeight / 2
    })

    if (activeChannelEl) {
      setActiveChannelId(activeChannelEl.id)
    }

    // Keep in the effect
    scrollY
  }, [scrollY])

  const onChannelClick = useCallback(
    (e: React.MouseEvent, channelId: string) => {
      e.preventDefault()

      const channelEl = document.getElementById(channelId)
      if (!channelEl) return

      window.scrollTo({
        top:
          channels[0]?.id === channelId
            ? 0
            : channelEl.offsetTop - window.innerHeight / 4,
        behavior: "smooth",
      })
    },
    [channels],
  )

  // #############################################################################
  // Render
  // #############################################################################
  return (
    <Page noWrap title="Week Recap">
      <S.InnerWrap>
        <S.Sidebar>
          <S.NavWrap>
            <S.Nav
              style={{
                translate: `0 -${S.NAV_ITEM_HEIGHT * activeChannelIndex}px`,
              }}
            >
              {channels.map((channel, i) => (
                <S.NavItem
                  key={channel.id}
                  href={`#${channel.id}`}
                  onClick={(e) => onChannelClick(e, channel.id)}
                  $active={channel.id === activeChannelId}
                >
                  <S.Pound />
                  {channel.name}
                </S.NavItem>
              ))}
            </S.Nav>
          </S.NavWrap>
        </S.Sidebar>
        <S.Content>
          {messagesByChannel.map(({ channel, messages }) => (
            <S.Channel
              id={channel.id}
              className={CHANNEL_CLASS_NAME}
              key={channel.id}
            >
              {messages.map((message) => (
                <RecapMessage
                  key={message.id}
                  message={message}
                  membersData={membersData}
                />
              ))}
            </S.Channel>
          ))}
        </S.Content>
      </S.InnerWrap>
    </Page>
  )
}

export const getServerSideProps: GetServerSideProps<RecapScreenProps> = async (
  ctx,
) => {
  const { origin } = absoluteUrl(ctx.req)
  const res = await fetch(`${origin}/api/recap`)
  const data = await res.json()

  return {
    props: {
      recap: data.recap,
      membersData: data.members,
    },
  }
}
