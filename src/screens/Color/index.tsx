import { useState } from "react"
import { Page } from "../../components/Page"
import { SketchPicker } from "react-color"

import * as S from "./styles"
import { SketchPickerStylesProps } from "react-color/lib/components/sketch/Sketch"
import { useCopyToClipboard } from "react-use"

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

  const copyText = `I want ${color1.toUpperCase()} and ${color2.toUpperCase()} gradient`

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
          {copyText}
        </S.Container>
      </S.Wrap>
    </Page>
  )
}
