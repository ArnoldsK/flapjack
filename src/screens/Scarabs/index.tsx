import { GetServerSideProps } from "next"
import Image from "next/image"
import absoluteUrl from "next-absolute-url"
import { useMemo } from "react"
import { useCopyToClipboard } from "react-use"

import { mapping } from "./mapping"
import * as S from "./styles"

import { d } from "~/server/utils/date"
import { Page } from "~/src/components/Page"
import { PoeScarab, PoeScarabData } from "~/types/poe"

const BAD_VALUE_MAX = 1
const GOOD_VALUE_MIN = 2

interface ScarabsScreenProps {
  data: PoeScarabData
}

export const ScarabsScreen = ({ data }: ScarabsScreenProps) => {
  const scarabByName = useMemo(() => {
    return new Map(data.scarabs.map((scarab) => [scarab.name, scarab]))
  }, [data.scarabs])

  const updatedString = useMemo(() => {
    return d(data.updatedAt).fromNow()
  }, [data.updatedAt])

  // #############################################################################
  // Render
  // #############################################################################
  return (
    <Page title="PoE Scarabs">
      <S.Wrap>
        <S.Title>Scarabs in {data.league}</S.Title>
        <S.Rows>
          {mapping.rows.map((row, rowIndex) => (
            <S.Row key={rowIndex}>
              {row.columns.map((column, columnIndex) => (
                <S.Column key={columnIndex} $align={column.align}>
                  {column.groups.map((group, groupIndex) => (
                    <S.GroupWrap key={groupIndex}>
                      {!!group.name && <S.GroupName>{group.name}</S.GroupName>}
                      <S.Group>
                        {group.scarabs.map((name) => {
                          const scarab = scarabByName.get(name)

                          return scarab ? (
                            <Scarab key={name} scarab={scarab} />
                          ) : (
                            <S.BlankScarab key={name} />
                          )
                        })}
                      </S.Group>
                    </S.GroupWrap>
                  ))}
                </S.Column>
              ))}
            </S.Row>
          ))}
        </S.Rows>
        <S.Note>Updated {updatedString}</S.Note>
      </S.Wrap>
    </Page>
  )
}

const Scarab = ({ scarab }: { scarab: PoeScarab }) => {
  const value = Math.floor(scarab?.chaosValue ?? 0)
  const bad = value < BAD_VALUE_MAX
  const good = value > GOOD_VALUE_MIN

  const [, copyToClipboard] = useCopyToClipboard()

  return (
    <S.Scarab
      $bad={bad}
      $good={good}
      onClick={() => copyToClipboard(scarab.name)}
    >
      <S.ScarabIcon>
        <Image src={scarab.icon} alt="" fill />
      </S.ScarabIcon>
      <S.ScarabPrice>{value}c</S.ScarabPrice>
      <S.ScarabLabel>{scarab.name}</S.ScarabLabel>
    </S.Scarab>
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
