import styled from "styled-components"
import Link from "next/link"

const BaseLink = styled(Link)`
  display: block;
  color: #aaa;
  transition: 0.2s ease-in-out;
`

export const Menu = styled.div`
  position: fixed;
  z-index: 1000;
  bottom: 10vh;
  left: 50%;
  max-width: calc(100vw - 32px);
  translate: -50% 0;

  display: flex;
  align-items: center;

  background: #252525;
  box-shadow: 0 8px 32px -8px rgba(0 0 0 / 0.5);
  border-radius: 16px;
  padding: 8px;

  animation: fade-in 4s forwards ease-in-out,
    slide-in-up 4s forwards ease-in-out;
`

export const MenuItems = styled.div`
  min-width: 0;
  padding: 8px;
  display: flex;
  align-items: center;
  overflow-x: auto;
`

export const MenuItem = styled(BaseLink)`
  padding: 16px 32px;
  border-radius: 8px;
  white-space: nowrap;

  &:hover {
    background: rgba(255 255 255 / 0.1);
  }
`

export const Back = styled(BaseLink)`
  position: fixed;
  z-index: 1000;
  top: 4px;
  left: 4px;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  &:hover {
    background: rgba(255 255 255 / 0.1);
  }
`
