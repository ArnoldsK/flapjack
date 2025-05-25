import { useRouter } from "next/router"

import * as S from "./styles"

const MENU_ITEMS = [
  {
    name: "Weekly recap",
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M 12 2.0996094 L 1 12 L 4 12 L 4 21 L 11 21 L 11 15 L 13 15 L 13 21 L 20 21 L 20 12 L 23 12 L 12 2.0996094 z M 12 4.7910156 L 18 10.191406 L 18 11 L 18 19 L 15 19 L 15 13 L 9 13 L 9 19 L 6 19 L 6 10.191406 L 12 4.7910156 z"></path>
      </svg>
    </S.Back>
  )
}
