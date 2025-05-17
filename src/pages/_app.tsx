import type { AppProps } from "next/app"
import { createGlobalStyle, ThemeProvider } from "styled-components"

const GlobalStyle = createGlobalStyle`
  @keyframes spin-expand-in {
    0% {
      transform: scale(0.2) rotate(-15deg);
    }

    75% {
      transform: scale(1.2) rotate(15deg);
    }

    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes spin-horizontal {
    0% {
      transform: rotateY(0deg);
    }

    100% {
      transform: rotateY(360deg);
    }
  }

  @keyframes fade-in {
    0%,
    50% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    font-size: 16px;
    background: #222;
    color: #ddd;
    // Mainly for draw game
    overscroll-behavior: contain;
  }

  a {
    color: #a6bfe4;
    text-decoration: none;
  }

  p {
    margin: 4px 0;
  }

  code {
    display: inline-block;
    background: #333;
    padding: 4px;
    border-radius: 4px;
    margin: 0 4px;
    font-size: 12px;
  }

  blockquote {
    border-left: 4px solid #444;
    background: #2a2a2a;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4px 16px;
    border-radius: 4px;
    word-break: break-all;
  }
`

const theme = {}

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default App
