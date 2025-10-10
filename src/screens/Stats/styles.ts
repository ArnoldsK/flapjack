import styled, { css } from "styled-components"

export const Months = styled.div`
  margin: 40px 0 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`

export const Month = styled.div<{ active?: boolean }>`
  flex-shrink: 0;
  cursor: ${({ active }) => (active ? "default" : "pointer")};
  padding: 8px 12px;
  border-bottom: 2px solid ${({ active }) => (active ? "#ddd" : "transparent")};

  &:hover {
    ${({ active }) =>
      !active &&
      css`
        border-color: #444;
      `};
  }
`

export const Stats = styled.div`
  margin: 20px 0 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
`

export const StatColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

export const Stat = styled.div`
  border-radius: 8px;
  background: #2a2a2a;
  width: 350px;
  position: relative;
  overflow: hidden;
`

export const StatItemsWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
`

export const CollapseCheckbox = styled.input`
  all: unset;
  position: absolute;
  inset: 0;
  display: block;

  &:checked {
    display: none;
  }

  &:not(:checked) {
    cursor: pointer;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(42 42 42 / 0),
        rgba(42 42 42 / 1)
      );
    }
  }

  &:not(:checked) + ${StatItemsWrap} {
    max-height: 120px;
    overflow: hidden;
  }
`

export const StatItem = styled.div<{ $muted?: boolean }>`
  cursor: default;
  opacity: ${({ $muted }) => ($muted ? 0.5 : 1)};
  display: flex;
  align-items: center;
  gap: 8px;
`

export const StatIcon = styled.div`
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.5;
  margin-right: -4px;
`

export const StatText = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export const CountBadge = styled.div`
  flex-shrink: 0;
  min-width: 50px;
  text-align: center;
  display: inline-block;
  background: #b492d433;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
`

export const CalendarWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 4px;
`

interface DayProps {
  $active?: boolean
  $hover?: boolean
  $disabled?: boolean
}
export const Day = styled.div<DayProps>`
  cursor: ${({ $active, onClick }) =>
    onClick && !$active ? "pointer" : "default"};
  text-align: center;
  border-radius: 8px;
  padding: 8px;
  border: 1px solid
    ${({ $active, $hover }) =>
      $active ? "#b492d4" : $hover ? "#b492d488" : "transparent"};

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.33;
    `}

  &:hover {
    ${({ $active, $disabled }) =>
      !$active &&
      !$disabled &&
      css`
        border-color: #b492d488;
      `};
  }
`

export const GraphWrap = styled.div`
  display: flex;
  height: 150px;
  margin: 8px;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
`

interface GraphBarProps {
  $active?: boolean
}
export const GraphBar = styled.div<GraphBarProps>`
  flex-grow: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
  cursor: ${({ onClick }) => (onClick ? "pointer" : "default")};
  background: #222;

  &::after {
    content: "";
    width: 100%;
    background: var(--bar-background);
    height: var(--bar-height);
  }

  ${({ $active }) =>
    $active
      ? css`
          &::after {
            background: #b492d4;
          }
        `
      : css`
          &:hover {
            &::after {
              background: #b492d488;
            }
          }
        `}
`
