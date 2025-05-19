import styled, { css } from "styled-components"

import { BREAKPOINTS } from "~/constants/layout"

export const NAV_ITEM_HEIGHT = 33

export const InnerWrap = styled.div`
  background: #313338;
  display: flex;
`

export const Sidebar = styled.div`
  position: sticky;
  top: 0;
  flex-shrink: 0;
  width: 240px;
  height: 100vh;
  background: #2b2d31;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media ${BREAKPOINTS.TABLET_DOWN} {
    display: none;
  }
`

export const NavWrap = styled.div`
  position: relative;
`

export const Nav = styled.nav`
  position: absolute;
  width: 100%;
  top: 0;

  transition: translate 0.2s ease-in-out;
  translate: 0 0;

  display: flex;
  flex-direction: column;
  padding: 0 8px;
`

export const NavItem = styled.a<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #767a83;
  text-decoration: none;
  padding: 6px 8px;
  border-radius: 4px;
  margin-bottom: 2px;
  translate: 0 -50%;
  height: ${NAV_ITEM_HEIGHT}px;

  &:hover {
    color: #d2d4d7;
    background: #35373c;
  }

  ${({ $active }) =>
    $active &&
    css`
      color: #ffffff !important;
      background: #404249 !important;
    `}
`

export const Pound = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-family: cursive;
  width: 20px;
  height: 20px;

  &::after {
    content: "#";
    color: #767a83;
    font-size: 17px;
    line-height: 1;
    font-weight: bold;
  }
`

export const Content = styled.div`
  padding: 33vh 0 20vh;
  width: 100%;
`

export const Channel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`
