import Head from "next/head"
import { PropsWithChildren } from "react"

import * as S from "./Page.styles"

export interface PageProps {
  title?: string
  centered?: boolean
}

export const Page = function Page({
  children,
  title,
  centered,
}: PropsWithChildren<PageProps>) {
  // #############################################################################
  // Render
  // #############################################################################
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <title>{title ? `${title} · Pepsi Dog` : "Pepsi Dog"}</title>
      </Head>
      <S.Main centered={centered}>{children}</S.Main>
    </>
  )
}
