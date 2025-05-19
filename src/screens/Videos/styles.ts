import styled from "styled-components"

import { PAGE_PADDING } from "~/src/components/Page/styles"

const VIDEOS_GAP = 32
const VIDEO_WIDTH = 366

const getMaxWidth = (count: number) => {
  return (VIDEO_WIDTH + VIDEOS_GAP) * count
}

const getBreakpoint = (count: number) => {
  const maxWidth = getMaxWidth(count) + PAGE_PADDING * 2

  return `(max-width: ${maxWidth}px)`
}

export const PageTitle = styled.h1`
  margin-bottom: 40px;
`

export const NoWrap = styled.span`
  white-space: nowrap;
`

export const Wrap = styled.div`
  width: 100%;
  max-width: ${getMaxWidth(4)}px;
  margin: 0 auto;
`

export const VideosWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  justify-content: space-between;
  gap: 32px;

  @media ${getBreakpoint(4)} {
    grid-template-columns: repeat(3, 1fr);
  }

  @media ${getBreakpoint(3)} {
    grid-template-columns: repeat(2, 1fr);
  }

  @media ${getBreakpoint(2)} {
    grid-template-columns: 1fr;
  }
`

export const Video = styled.a`
  display: flex;
  flex-direction: column;
  gap: 8px;

  width: 100%;
  color: inherit;
  position: relative;
  outline: none;

  &:hover,
  &:focus {
    &::after {
      content: "";
      position: absolute;
      z-index: -1;
      inset: -8px -8px -12px;
      border-radius: 16px;
      background: #333;
      box-shadow: 0 0 0 1px #888;
    }
  }
`

export const Thumbnail = styled.div<{ $src: string }>`
  width: 100%;
  aspect-ratio: ${16 / 9};

  background: url("${({ $src }) => $src}");
  background-size: cover;
  background-position: center;

  border-radius: 8px;
  overflow: hidden;
`

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  padding: 0 8px;
`

export const Title = styled.div`
  font-size: 16px;
  font-weight: bold;
`

export const Author = styled.div`
  font-size: 14px;
`
