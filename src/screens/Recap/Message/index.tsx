import Image from "next/image"
import {
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import reactStringReplace from "react-string-replace"
import { useWindowScroll } from "react-use"

import { Pound } from "../styles"
import { RecapMessage as RecapMessageGraph } from "../types"

import * as S from "./styles"

import { RECAP_PRIVATE_CHANNEL_IDS } from "~/constants"
import { d } from "~/server/utils/date"
import { clamp, interpolate } from "~/server/utils/number"
import { ApiRecapMember } from "~/types/api"

interface RecapMessageProps {
  message: RecapMessageGraph
  membersData: ApiRecapMember[]
}

interface MessageUrl {
  https: string
  intent: string
}

const MESSAGE_CLASS_NAME = "recap-message"

export const RecapMessage = ({ message, membersData }: RecapMessageProps) => {
  // #############################################################################
  // Data
  // #############################################################################
  const isPrivate = useMemo(() => {
    return RECAP_PRIVATE_CHANNEL_IDS.includes(message.channel.id)
  }, [message.channel.id])

  const memberData = useMemo(() => {
    const data = membersData.find((data) => data.memberId === message.member.id)

    return {
      avatarUrl: data?.avatarUrl ?? "/static/img/server-icon.png",
      displayColor: data?.displayColor ?? "#fff",
    }
  }, [membersData, message.member.id])

  const content = useMemo((): ReactNode => {
    if (isPrivate) {
      return <S.HugeEmoji>🔒</S.HugeEmoji>
    }

    return message.content
      .split("\n")
      .map((line) =>
        reactStringReplace(line, /<a?:.+?:(\d+)>/g, (match, i) => {
          return (
            <Image
              key={i + match}
              src={`https://cdn.discordapp.com/emojis/${match}.webp?size=16`}
              alt={match}
              width={S.REACTION_EMOJI_SIZE}
              height={S.REACTION_EMOJI_SIZE}
            />
          )
        }),
      )
      .map((line, i) => <div key={i}>{line}</div>)
  }, [isPrivate, message.content])

  // #############################################################################
  // Scroll into view
  // #############################################################################
  const wrapRef = useRef<HTMLDivElement>(null)
  const { y: scrollY } = useWindowScroll()

  useEffect(() => {
    const wrapEl = wrapRef.current
    if (!wrapEl) return

    const wH = window.innerHeight
    // At which point should the image transition "reach it's goal"
    // If it's 0.5, the image will be normalized when it's in the middle of the screen
    const goalY = wH * 0.5

    const bb = wrapEl.getBoundingClientRect()

    const offsetY = bb.top - goalY
    const offsetStartY = wH - goalY

    const transformPrc = clamp((offsetY / offsetStartY) * 100, 0, 100)

    // Adjust message style
    const msgEl = wrapEl.querySelector(
      `.${MESSAGE_CLASS_NAME}`,
    ) as HTMLDivElement
    const translateY = transformPrc
    const scale = interpolate(transformPrc, 100, 0, 0, 1)

    msgEl.style.translate = `0 ${translateY}%`
    msgEl.style.scale = String(scale)
  }, [scrollY])

  // #############################################################################
  // Video
  // #############################################################################
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = videoRef.current

    if (!el) return

    if (playing) {
      el.play()
    } else {
      el.pause()
      el.currentTime = 0
    }
  }, [playing])

  // #############################################################################
  // Navigate
  // #############################################################################
  const url = useMemo((): MessageUrl => {
    const base = `discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`

    return {
      https: `https://${base}`,
      intent: `discord://${base}`,
    }
  }, [message.channel.id, message.guild.id, message.id])

  /** @see https://stackoverflow.com/a/66242322/3893356 */
  const handleNavigate = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()

      let blurred = false

      window.addEventListener("blur", () => {
        blurred = true
      })

      location.replace(url.intent)

      setTimeout(() => {
        if (!blurred) {
          location.assign(url.https)
        }
      }, 1000)
    },
    [url.https, url.intent],
  )

  // #############################################################################
  // Render
  // #############################################################################
  return (
    <S.Wrap ref={wrapRef}>
      <S.Message
        className={MESSAGE_CLASS_NAME}
        href={url.https}
        onClick={(e) => handleNavigate(e)}
      >
        <S.ChannelName>
          <Pound />
          {message.channel.name}
        </S.ChannelName>
        <S.MessageLeft>
          <S.Avatar>
            <Image
              src={memberData.avatarUrl}
              alt={message.member.username}
              width={40}
              height={40}
            />
          </S.Avatar>
        </S.MessageLeft>
        <S.MessageRight>
          <S.Header>
            <S.Name $color={memberData.displayColor}>
              {message.member.displayName ?? message.member.username}
            </S.Name>
            <S.Date>{d(message.createdAt).format("DD/MM/YYYY HH:MM")}</S.Date>
          </S.Header>
          <S.MessageBody>
            <S.Content>{content}</S.Content>

            {!isPrivate && message.firstAttachment && (
              <S.MediaWrap>
                {message.firstAttachment.isImage && (
                  <S.Image src={message.firstAttachment.url} alt="" />
                )}
                {message.firstAttachment.isVideo && (
                  <S.VideoWrap $playing={playing}>
                    <S.Video
                      ref={videoRef}
                      onMouseEnter={() => setPlaying(true)}
                      onMouseLeave={() => setPlaying(false)}
                      src={message.firstAttachment.url}
                      playsInline
                    />
                  </S.VideoWrap>
                )}
                {!message.firstAttachment.isImage &&
                  !message.firstAttachment.isVideo && (
                    <S.HugeEmoji>🖼️</S.HugeEmoji>
                  )}
              </S.MediaWrap>
            )}

            <S.ReactionsWrap>
              {message.reactions.map(({ emoji, count }) => (
                <S.Reaction key={emoji.identifier}>
                  <S.ReactionEmoji>
                    {emoji.url ? (
                      <Image
                        src={emoji.url}
                        alt={emoji.identifier}
                        width={16}
                        height={16}
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      decodeURI(emoji.identifier)
                    )}
                  </S.ReactionEmoji>
                  <S.ReactionCount>{count}</S.ReactionCount>
                </S.Reaction>
              ))}
            </S.ReactionsWrap>
          </S.MessageBody>
        </S.MessageRight>
      </S.Message>
    </S.Wrap>
  )
}
