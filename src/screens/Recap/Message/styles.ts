import styled, { css } from "styled-components"
import { BREAKPOINTS } from "~/constants/layout"

export const REACTION_EMOJI_SIZE = 16

export const Wrap = styled.div`
  width: 100%;
  max-width: 694px;
  margin-bottom: 33vh;
`

export const Message = styled.a`
  display: flex;
  min-height: 48px;
  padding: 8px;
  border-radius: 8px;
  position: relative;

  &:hover {
    background: #2e3035;
  }
`

export const ChannelName = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: bold;
  color: #767a83;
  opacity: 0.5;
  font-size: 17px;
  position: absolute;
  padding-left: 72px;
  bottom: 100%;

  @media ${BREAKPOINTS.TABLET_UP} {
    display: none;
  }
`

export const MessageLeft = styled.div`
  display: flex;
  justify-content: center;
  width: 72px;
  flex-shrink: 0;
`

export const MessageRight = styled.div`
  padding-right: 72px;

  @media ${BREAKPOINTS.TABLET_DOWN} {
    padding-right: 36px;
  }
`

export const Header = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  line-height: 1.3;
  min-height: 22px;
`

export const Name = styled.div<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 16px;
  font-weight: bold;
`

export const Date = styled.div`
  color: #949ba4;
  font-size: 12px;
`

export const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const MessageBody = styled.div`
  font-size: 16px;
  line-height: 1.3;
  color: #dbdee1;
`

export const Content = styled.div`
  word-break: break-word;
`

export const MediaWrap = styled.div`
  max-width: 550px;
  overflow: hidden;
  border-radius: 8px;
  margin-top: 4px;
`

export const Image = styled.img`
  display: block;
  max-width: 100%;
  max-height: 66vh;
`

export const VideoWrap = styled.div<{ $playing?: boolean }>`
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  &::after {
    content: "";
    position: absolute;
    z-index: 1;
    border: 9px solid transparent;
    border-right-width: 0;
    border-left: 18px solid #ddd;
    filter: drop-shadow(0 0 4px #222);
  }

  ${({ $playing }) =>
    $playing &&
    css`
      &::after {
        display: none;
      }
    `}
`

export const Video = styled.video`
  max-width: 100%;
  max-height: 50vh;
  height: auto;
  display: block;
  border-radius: 4px;
  box-shadow: 0 0 0 1px #444;
`

export const HugeEmoji = styled.div`
  font-size: 24px;
  line-height: 1;
`

export const ReactionsWrap = styled.div`
  margin-top: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
`

export const Reaction = styled.div`
  border-radius: 8px;
  background: #292b2f;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #b5bac1;
`

export const ReactionEmoji = styled.div`
  position: relative;
  width: ${REACTION_EMOJI_SIZE}px;
  height: ${REACTION_EMOJI_SIZE}px;
  font-size: ${REACTION_EMOJI_SIZE}px;
  line-height: 1;
`

export const ReactionCount = styled.div`
  font-size: 16px;
  font-weight: bold;
`
