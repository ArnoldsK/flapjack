import styled, { css } from "styled-components"
import { randomInt } from "../../../server/utils/random"

export const GRID_ITEM_CLASS_NAME = "grid-item"
export const GRID_ITEM_SIZE = 250
export const AVATAR_SIZE = 128

export const AVATAR_INITIAL_SPEED = 1000
export const AVATAR_INITIAL_DELAY = 2000

export const GridItem = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  translate: -50% -50%;
  width: ${GRID_ITEM_SIZE}px;
  height: ${GRID_ITEM_SIZE}px;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  transition: top 200ms ease-in-out, left 200ms ease-in-out;
  will-change: top, left;
`

interface AvatarProps {
  $animate: boolean
  $x: number
  $y: number
}
export const Avatar = styled.div.attrs(({ $x, $y }: AvatarProps) => ({
  style: {
    left: $x,
    top: $y,
  },
}))<AvatarProps>`
  width: ${AVATAR_SIZE}px;
  height: ${AVATAR_SIZE}px;
  position: absolute;

  ${({ $animate }) =>
    $animate &&
    css`
      transform: scale(0);
      animation: spin-expand-in
        ${randomInt(AVATAR_INITIAL_SPEED * 0.5, AVATAR_INITIAL_SPEED)}ms
        ${randomInt(AVATAR_INITIAL_DELAY * 0.5, AVATAR_INITIAL_DELAY)}ms
        forwards ease-in-out;
    `}

  transition: opacity 200ms ease-in;
  opacity: 0.33;

  &:hover {
    opacity: 1;
  }

  ${({ onClick }) =>
    onClick &&
    css`
      cursor: pointer;
    `}

  img {
    border-radius: 50%;
    pointer-events: none;
    user-select: none;
    perspective: ${AVATAR_SIZE * 4}px;
    transition: all 200ms ease-out;
  }
`
