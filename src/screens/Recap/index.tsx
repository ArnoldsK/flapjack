import type { GetServerSideProps } from "next"
import absoluteUrl from "next-absolute-url"
import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react"

import { RecapMessage } from "./Message"
import * as S from "./styles"
import { MessagesByChannel, RecapScreenProps } from "./types"

import { RECAP_CHANNEL_IDS } from "~/constants"
import { Page } from "~/src/components/Page"

const CHANNEL_CLASS_NAME = "recap-channel"

export const Recap = ({ recap, membersData }: RecapScreenProps) => {
  // #############################################################################
  // Messages
  // #############################################################################
  const [messagesByChannel, setMessagesByChannel] = useState<
    MessagesByChannel[]
  >([])

  const getSortedChannelMessages = useCallback(
    (channelId: string) => {
      return recap.messages
        .filter((el) => el.channel.id === channelId)
        .sort(
          (a, b) =>
            // More reactions first
            b.reactionCount - a.reactionCount ||
            // Older first
            Date.parse(a.createdAt as unknown as string) -
              Date.parse(b.createdAt as unknown as string),
        )
    },
    [recap.messages],
  )

  useEffect(() => {
    setMessagesByChannel(
      RECAP_CHANNEL_IDS.map((channelId): MessagesByChannel | null => {
        const sortedMessages = getSortedChannelMessages(channelId)
        const messages = sortedMessages.slice(0, 5)
        const moreMessages = sortedMessages.slice(5)

        if (moreMessages.length === 1) {
          // Just add it to the main list, no point in asking to show 1 more
          messages.push(...moreMessages)
          moreMessages.length = 0
        }

        return messages.length > 0
          ? {
              channel: messages[0].channel,
              messages,
              moreMessages,
            }
          : null
      }).filter((el): el is MessagesByChannel => !!el),
    )
  }, [getSortedChannelMessages, recap.messages])

  // #############################################################################
  // Channels
  // #############################################################################
  const [activeChannelId, setActiveChannelId] = useState<string>()

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
    const onScroll = () => {
      const channelEls = [
        ...document.querySelectorAll(`.${CHANNEL_CLASS_NAME}`),
      ] as HTMLDivElement[]

      const activeChannelEl = channelEls.reverse().find((el) => {
        const bb = el.getBoundingClientRect()

        return bb.top < window.innerHeight / 2
      })

      if (activeChannelEl) {
        setActiveChannelId(activeChannelEl.id.slice(1))
      }
    }

    window.addEventListener("scroll", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  const onChannelClick = useCallback(
    (e: MouseEvent, channelId: string) => {
      e.preventDefault()

      const channelEl = document.querySelector(`#c${channelId}`)
      if (!channelEl) return

      window.scrollTo({
        top:
          channels[0]?.id === channelId
            ? 0
            : (channelEl as HTMLElement).offsetTop - window.innerHeight / 4,
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
              {channels.map((channel) => (
                <S.NavItem
                  key={channel.id}
                  href={`#c${channel.id}`}
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
          {messagesByChannel.map(({ channel, messages, moreMessages }) => (
            <S.Channel
              id={`c${channel.id}`}
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
              {moreMessages.length > 0 && (
                <S.MoreMessagesWrap>
                  <input type="checkbox" id={`show-more-${channel.id}`} />
                  <S.ShowMoreLabel htmlFor={`show-more-${channel.id}`}>
                    Show {moreMessages.length} more
                  </S.ShowMoreLabel>
                  {moreMessages.map((message) => (
                    <RecapMessage
                      key={message.id}
                      message={message}
                      membersData={membersData}
                    />
                  ))}
                </S.MoreMessagesWrap>
              )}
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
