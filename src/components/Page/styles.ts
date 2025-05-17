import styled, { css } from "styled-components"

export const PAGE_PADDING = 32

export const Wrap = styled.main<{ $centered?: boolean }>`
  padding: 0 ${PAGE_PADDING}px;

  ${({ $centered }) =>
    $centered
      ? css`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        `
      : css`
          margin: 40px auto 80px;
        `}
`
