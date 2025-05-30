import Head from "next/head"
import { PropsWithChildren } from "react"

import { Navigation } from "./Navigation"
import * as S from "./styles"

export interface PageProps {
  title?: string
  centered?: boolean
  noWrap?: boolean
}

export const Page = function Page({
  title,
  children,
  centered,
  noWrap,
}: PropsWithChildren<PageProps>) {
  // #############################################################################
  // Render
  // #############################################################################
  return (
    <>
      <Head>
        <meta charSet="utf8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <title>{title ? `${title} · Pepsi Dog` : "Pepsi Dog"}</title>
      </Head>
      {noWrap ? children : <S.Wrap $centered={centered}>{children}</S.Wrap>}
      <Navigation />
    </>
  )
}
