import styled, { keyframes } from "styled-components"

const spinExpandIn = keyframes`
  0% {
    transform: scale(0.2) rotate(-15deg);
  }

  75% {
    transform: scale(1.2) rotate(15deg);
  }

  100% {
    transform: scale(1) rotate(0deg);
  }
`

const spinHorizontal = keyframes`
  0% {
    transform: rotateY(0deg);
  }

  100% {
    transform: rotateY(360deg);
  }
`

const fadeIn = keyframes`
  0%,
  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`

export const LogoWrap = styled.a`
  display: block;
  position: relative;
`

export const Logo = styled.img`
  border-radius: 50%;
  width: 128px;
  height: 128px;
  animation: ${spinExpandIn} 1s forwards ease-in-out,
    ${spinHorizontal} 3s 1s infinite ease-in-out;
`

export const Floater = styled.div`
  color: #888;
  font-size: 12px;
  margin-top: 10px;
  animation: ${fadeIn} 2s forwards ease-in-out;
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
