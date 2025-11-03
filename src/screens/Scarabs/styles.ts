import styled from "styled-components"

import { checkUnreachable } from "~/server/utils/error"

const SCARAB_SIZE = 40
const SCARAB_PADDING = 4

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: -80px;
`

export const Title = styled.h1`
  margin: 0;
`

export const Note = styled.div`
  color: #555;
  font-size: 12px;
`

export const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const Row = styled.div`
  display: flex;
  justify-content: center;
  gap: 28px;
`

interface ColumnProps {
  $align: "left" | "center"
}
export const Column = styled.div<ColumnProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;

  align-items: ${({ $align }) => {
    switch ($align) {
      case "left": {
        return "flex-start"
      }
      case "center": {
        return "center"
      }
      default: {
        checkUnreachable($align)
      }
    }
  }};
`

export const GroupWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const GroupName = styled.div`
  font-size: 12px;
  color: #555;
`

export const Group = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

export const ScarabIcon = styled.div`
  position: relative;
  width: ${SCARAB_SIZE - SCARAB_PADDING * 2}px;
  aspect-ratio: 1;
`

export const ScarabPrice = styled.div`
  position: absolute;
  z-index: 1;
  font-size: 12px;
  line-height: 1;
  right: ${SCARAB_PADDING / 2}px;
  bottom: ${SCARAB_PADDING / 2}px;
  filter: drop-shadow(-1px 0 0 #222) drop-shadow(1px 0 0 #222)
    drop-shadow(0 -1px 0 #222) drop-shadow(0 1px 0 #222);
`

export const ScarabLabel = styled.div`
  position: absolute;
  z-index: 2;
  bottom: calc(100% + 5px);
  white-space: nowrap;
  display: none;
  pointer-events: none;
  background: #000;
  border-radius: ${SCARAB_PADDING}px;
  padding: ${SCARAB_PADDING}px;
`

export const BlankScarab = styled.div`
  width: ${SCARAB_SIZE}px;
  height: ${SCARAB_SIZE}px;
`

interface ScarabProps {
  $bad: boolean
  $good: boolean
}
export const Scarab = styled(BlankScarab)<ScarabProps>`
  position: relative;
  border-radius: ${SCARAB_PADDING}px;
  padding: ${SCARAB_PADDING}px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: ${({ $bad, $good }) => {
    if ($bad) {
      return "#4b1a1a"
    }
    if ($good) {
      return "#1a4b1a"
    }
    return "#333333"
  }};
  cursor: pointer;

  &:hover {
    ${ScarabLabel} {
      display: block;
    }
  }
`
