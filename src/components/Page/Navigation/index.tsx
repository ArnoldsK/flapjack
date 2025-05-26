import { useRouter } from "next/router"

import BackIcon from "./back.svg"
import * as S from "./styles"

const MENU_ITEMS = [
  {
    name: "Recap",
    path: "/recap",
  },
  {
    name: "Stats",
    path: "/stats",
  },
  {
    name: "Videos",
    path: "/videos",
  },
  {
    name: "Color",
    path: "/color",
  },
]

export const Navigation = () => {
  const router = useRouter()

  const isHome = router.pathname === "/"

  // #############################################################################
  // Render
  // #############################################################################
  return isHome ? (
    <S.Menu>
      <S.MenuItems>
        {MENU_ITEMS.map((item) => (
          <S.MenuItem key={item.path} href={item.path}>
            {item.name}
          </S.MenuItem>
        ))}
      </S.MenuItems>
    </S.Menu>
  ) : (
    <S.Back href="/">
      <BackIcon />
    </S.Back>
  )
}
