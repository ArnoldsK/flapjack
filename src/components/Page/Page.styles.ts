import styled, { css } from "styled-components"

export const Main = styled.main<{ centered?: boolean }>`
  ${({ centered }) =>
    centered &&
    css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    `}
`
