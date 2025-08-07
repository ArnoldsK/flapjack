import { useState } from "react"
import { SketchPicker } from "react-color"
import { SketchPickerStylesProps } from "react-color/lib/components/sketch/Sketch"
import { useCopyToClipboard } from "react-use"

import * as S from "./styles"

import { Page } from "~/src/components/Page"

const TEXT = "Pepsi Dog"

const PICKER_STYLES: Partial<SketchPickerStylesProps> = {
  picker: {
    background: "#1a1a1e",
    boxShadow: "none",
  },
}

export const ColorScreen = () => {
  const [color1, setColor1] = useState("#a9c9ff")
  const [color2, setColor2] = useState("#ffbbec")

  const copyText = `/color gradient color1:${color1.toUpperCase()} color2:${color2.toUpperCase()}`

  const [, copyToClipboard] = useCopyToClipboard()

  // #############################################################################
  // Render
  // #############################################################################
  return (
    <Page title="Color" centered>
      <S.Wrap>
        <S.NameContainer>
          <S.ContainerNote>Interact to preview</S.ContainerNote>
          <S.Name $color1={color1} $color2={color2} $text={TEXT}>
            {TEXT}
          </S.Name>
        </S.NameContainer>
        <S.ColorsWrap>
          <SketchPicker
            color={color1}
            onChange={(color) => setColor1(color.hex)}
            disableAlpha
            presetColors={[]}
            styles={{
              default: PICKER_STYLES,
            }}
          />
          <SketchPicker
            color={color2}
            onChange={(color) => setColor2(color.hex)}
            disableAlpha
            presetColors={[]}
            styles={{
              default: PICKER_STYLES,
            }}
          />
        </S.ColorsWrap>
        <S.Container onClick={() => copyToClipboard(copyText)}>
          <S.ContainerNote>Click to copy</S.ContainerNote>
          <S.ContainerText>{copyText}</S.ContainerText>
        </S.Container>
      </S.Wrap>
    </Page>
  )
}
