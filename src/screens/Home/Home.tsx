import { Page } from "@components/Page"

import * as S from "./Home.styles"

const DISCORD_INVITE_URL = "https://discord.gg/j6wSTnukKn"

export const Home = function Home() {
  // #############################################################################
  // Render
  // #############################################################################
  return (
    <Page centered>
      <h1>Pepsi Dog</h1>
      <S.LogoWrap href={DISCORD_INVITE_URL}>
        <S.Logo src="img/bepsi-512.png" alt="Pepsi Dog" />
        <S.Floater>Click to join</S.Floater>
      </S.LogoWrap>
    </Page>
  )
}
