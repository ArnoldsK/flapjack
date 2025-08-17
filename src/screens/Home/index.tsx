import { GetServerSideProps } from "next"
import absoluteUrl from "next-absolute-url"

import * as S from "./styles"

import { AvatarGrid } from "~/src/components/AvatarGrid"
import { Page } from "~/src/components/Page"
import { ApiAvatars } from "~/types/api"

const DISCORD_INVITE_URL = "https://discord.gg/j6wSTnukKn"

interface HomeScreenProps {
  avatars: ApiAvatars
}

export const HomeScreen = ({ avatars }: HomeScreenProps) => {
  // #############################################################################
  // Render
  // #############################################################################
  return (
    <Page centered>
      <AvatarGrid avatarUrls={avatars.urls} />
      <S.Header>
        <h1>Pepsi Dog</h1>
        <div>Latviešu Discord komūna</div>
      </S.Header>
      <S.LogoWrap href={DISCORD_INVITE_URL}>
        <S.Logo src="/static/img/bepsi-512.png" alt="Pepsi Dog" />
        <S.Floater>Click to join</S.Floater>
      </S.LogoWrap>
    </Page>
  )
}

export const getServerSideProps: GetServerSideProps<HomeScreenProps> = async (
  ctx,
) => {
  const { origin } = absoluteUrl(ctx.req)
  const res = await fetch(`${origin}/api/avatars`)
  const avatars = await res.json()

  return {
    props: {
      avatars,
    },
  }
}
