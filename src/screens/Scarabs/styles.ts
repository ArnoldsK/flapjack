import styled from "styled-components"

import { checkUnreachable } from "~/server/utils/error"

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 28px;
`

export const Title = styled.h1`
  margin: 0;
`

export const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  gap: 14px;

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

export const Group = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

export const ScarabPrice = styled.div`
  font-size: 12px;
`

export const ScarabLabel = styled.div`
  position: absolute;
  bottom: calc(100% + 5px);
  left: 50%;
  translate: -50% 0;
  white-space: nowrap;
  display: none;
  pointer-events: none;
  background: #000;
  border-radius: 4px;
  padding: 4px;
`

interface ScarabProps {
  $blank: boolean
  $bad: boolean
  $good: boolean
}
export const Scarab = styled.div<ScarabProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  position: relative;
  border-radius: 4px;

  &:hover {
    ${ScarabLabel} {
      display: block;
    }
  }

  background: ${({ $blank, $bad, $good }) => {
    if ($blank) {
      return "none"
    }
    if ($bad) {
      return "#4b1a1a"
    }
    if ($good) {
      return "#1a4b1a"
    }
    return "#333333"
  }};
`
