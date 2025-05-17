import styled from "styled-components"

export const GRID_ITEM_CLASS_NAME = "grid-item"
export const GRID_ITEM_SIZE = 128

export const Wrap = styled.div`
  position: fixed;
  inset: 0;
  height: calc(60vh + ${GRID_ITEM_SIZE * 0.5}px);
  overflow: hidden;
`

export const ImageGridRow = styled.div`
  display: flex;
  justify-content: flex-start;

  &:nth-child(3n + 2) {
    margin-left: -${GRID_ITEM_SIZE * 0.33}px;
  }

  &:nth-child(3n) {
    margin-left: -${GRID_ITEM_SIZE * 0.66}px;
  }
`

export const GridItem = styled.div`
  flex-shrink: 0;
  position: relative;
  width: ${GRID_ITEM_SIZE}px;
  aspect-ratio: 1;

  img {
    pointer-events: none;
    user-select: none;
    perspective: ${GRID_ITEM_SIZE * 4}px;
    transition: all 200ms ease-out;
  }
`

export const RadialGradient = styled.div`
  pointer-events: none;
  position: absolute;
  z-index: 1;
  inset: 0;
  background: radial-gradient(rgba(0 0 0 / 0.33), #222);
`

const Gradient = styled.div`
  pointer-events: none;
  position: absolute;
  z-index: 1;
`

export const GradientTop = styled(Gradient)`
  top: 0;
  left: 0;
  width: 100%;
  height: 33%;
  background: linear-gradient(to bottom, #222, rgba(0 0 0 / 0));
`

export const GradientBottom = styled(GradientTop)`
  top: auto;
  bottom: 0;
  background: linear-gradient(to top, #222, rgba(0 0 0 / 0));
`
