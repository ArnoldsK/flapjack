import styled, { css, keyframes } from "styled-components"
import { PAGE_PADDING } from "../../components/Page/styles"

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const Container = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 64px;
  background: #1a1a1e;
  border-radius: 8px;

  ${({ onClick }) =>
    onClick &&
    css`
      cursor: pointer;
    `}
`

export const ContainerNote = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  opacity: 0.5;
  pointer-events: none;
`

const animate = keyframes`
  0% {
    background-position: 0
  }

  to {
    background-position: 100px
  }
`

export const Name = styled.div<{
  $color1: string
  $color2: string
  $text: string
}>`
  cursor: default;
  position: relative;
  z-index: 0;

  ${({ $color1, $color2 }) => css`
    background: linear-gradient(to right, ${$color1}, ${$color2}, ${$color1});
  `};

  -webkit-background-clip: text;
  background-clip: text;
  background-size: 100px auto;
  -webkit-text-fill-color: transparent;

  &::after {
    content: "${({ $text }) => $text}";
    background: inherit;
    -webkit-background-clip: text;
    background-clip: text;
    inset: 0;
    position: absolute;
    -webkit-text-fill-color: transparent;
    filter: blur(4px);
    opacity: 0;
    transition: opacity 0.1s ease-in-out;
    z-index: -1;
  }
`

export const NameContainer = styled(Container)`
  &:hover {
    ${Name} {
      animation: ${animate} 1.5s linear infinite;

      &::after {
        opacity: 0.7;
      }
    }
  }
`

export const ColorsWrap = styled.div`
  display: flex;
  gap: 16px;

  * {
    user-select: none;
  }

  input {
    background: #1a1a1a !important;
    color: inherit !important;
    box-shadow: none !important;
  }

  label {
    color: inherit !important;
  }

  @media (max-width: ${456 + PAGE_PADDING}px) {
    flex-direction: column;
    align-items: center;
  }
`
