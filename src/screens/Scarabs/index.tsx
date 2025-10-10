import { GetServerSideProps } from "next"
import absoluteUrl from "next-absolute-url"
import { useCallback, useMemo } from "react"

import layout from "./layout.json"
import * as S from "./styles"

import { isNonNullish } from "~/server/utils/boolean"
import { Page } from "~/src/components/Page"
import { PoeScarab, PoeScarabData } from "~/types/poe"

const BLANK_SCARAB = "BLANK"
const BAD_VALUE_MAX = 1
const GOOD_VALUE_MIN = 2

interface ScarabsScreenProps {
  data: PoeScarabData
}

type LayoutScarab = typeof BLANK_SCARAB | PoeScarab

export const ScarabsScreen = ({ data }: ScarabsScreenProps) => {
  // #############################################################################
  // Map scarab data to layout
  // #############################################################################
  const rows = useMemo((): LayoutScarab[][][] => {
    return layout
      .map((groups) =>
        groups
          .map((names) =>
            names
              .map((name) => {
                if (!name) {
                  return BLANK_SCARAB
                }

                const scarab = data.scarabs.find(
                  (s) => s.name.toLowerCase() === name?.toLowerCase(),
                )

                if (!scarab) {
                  return null
                }

                return {
                  ...scarab,
                  chaosValue: Math.floor(scarab.chaosValue),
                }
              })
              .filter(isNonNullish),
          )
          .filter((g) => g.length > 0),
      )
      .filter((r) => r.length > 0)
  }, [data.scarabs])

  // #############################################################################
  // Eval values
  // #############################################################################
  const isBadScarab = useCallback((scarab: LayoutScarab) => {
    if (scarab === BLANK_SCARAB) {
      return false
    }
    return scarab.chaosValue < BAD_VALUE_MAX
  }, [])

  const isGoodScarab = useCallback((scarab: LayoutScarab) => {
    if (scarab === BLANK_SCARAB) {
      return false
    }
    return scarab.chaosValue > GOOD_VALUE_MIN
  }, [])

  // #############################################################################
  // Render
  // #############################################################################
  return (
    <Page title="PoE Scarabs">
      <S.Wrap>
        <S.Title>{data.league}</S.Title>
        <S.Rows>
          {rows.map((groups, rowIndex) => (
            <S.Row key={rowIndex}>
              {groups.map((scarabs, groupIndex) => (
                <S.Group key={groupIndex}>
                  {scarabs.map((scarab, scarabIndex) => (
                    <S.Scarab
                      key={scarabIndex}
                      $blank={scarab === BLANK_SCARAB}
                      $bad={isBadScarab(scarab)}
                      $good={isGoodScarab(scarab)}
                    >
                      {scarab !== BLANK_SCARAB && (
                        <>
                          <S.ScarabPrice>{scarab.chaosValue}c</S.ScarabPrice>
                          <S.ScarabLabel>{scarab.name}</S.ScarabLabel>
                        </>
                      )}
                    </S.Scarab>
                  ))}
                </S.Group>
              ))}
            </S.Row>
          ))}
        </S.Rows>
      </S.Wrap>
    </Page>
  )
}

export const getServerSideProps: GetServerSideProps<
  ScarabsScreenProps
> = async (ctx) => {
  const { origin } = absoluteUrl(ctx.req)
  const res = await fetch(`${origin}/api/scarabs`)
  const data = await res.json()

  return {
    props: {
      data,
    },
  }
}
