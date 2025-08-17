import styled from "styled-components"

export const Header = styled.div`
  margin: -32px 0 10px;
  display: flex;
  flex-direction: column;
  align-items: center;

  * {
    margin: 0;
  }
`

export const LogoWrap = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`

export const Logo = styled.img`
  border-radius: 50%;
  width: 128px;
  height: 128px;
  animation:
    spin-expand-in 1s forwards ease-in-out,
    spin-horizontal 3s 1s infinite ease-in-out;
`

export const Floater = styled.div`
  color: #888;
  font-size: 12px;
  line-height: 1;
  margin-top: 10px;
  animation: fade-in 2s forwards ease-in-out;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;

  &::after {
    content: "^";
    position: absolute;
    left: 50%;
    bottom: 100%;
    transform: translateX(-50%);
  }
`
