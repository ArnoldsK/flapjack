import { GetServerSideProps } from "next"
import absoluteUrl from "next-absolute-url"

import { mapping } from "./mapping"
import * as S from "./styles"

import { Page } from "~/src/components/Page"
import { PoeScarabData } from "~/types/poe"

const BAD_VALUE_MAX = 1
const GOOD_VALUE_MIN = 2

interface ScarabsScreenProps {
  data: PoeScarabData
}

export const ScarabsScreen = ({ data }: ScarabsScreenProps) => {
  // #############################################################################
  // Render
  // #############################################################################
  return (
    <Page title="PoE Scarabs">
      <S.Wrap>
        <S.Title>{data.league}</S.Title>
        <S.Rows>
          {mapping.rows.map((row, rowIndex) => (
            <S.Row key={rowIndex}>
              {row.columns.map((column, columnIndex) => (
                <S.Column key={columnIndex} $align={column.align}>
                  {column.groups.map((group, groupIndex) => (
                    <S.Group key={groupIndex}>
                      {group.map((name, nameIndex) => {
                        const scarab = data.scarabs.find(
                          (el) => el.name === name,
                        )

                        const value = Math.floor(scarab?.chaosValue ?? 0)
                        const bad = value < BAD_VALUE_MAX
                        const good = value > GOOD_VALUE_MIN

                        return (
                          <S.Scarab
                            key={nameIndex}
                            $blank={!scarab}
                            $bad={bad}
                            $good={good}
                          >
                            {!!scarab && (
                              <>
                                <S.ScarabPrice>{value}c</S.ScarabPrice>
                                <S.ScarabLabel>{scarab.name}</S.ScarabLabel>
                              </>
                            )}
                          </S.Scarab>
                        )
                      })}
                    </S.Group>
                  ))}
                </S.Column>
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
