import { writeFile } from "node:fs/promises"
import path from "node:path"

import { getJbCardsImage } from "~/server/canvas/jbCardsImage"
import { JacksBetter } from "~/server/utils/jacksbetter"

const run = async () => {
  const game = new JacksBetter()

  game.deal({ bet: 5 })

  console.log(
    "Cards:",
    game.cards.map((card) => card.id),
  )

  console.log(game.cardsHandName)

  console.log("Hold 1st and 3rd card")
  game.setCardHold(game.cards[0]!.id, true)
  game.setCardHold(game.cards[2]!.id, true)

  const draw = game.draw()

  console.log(game.cards.map((card) => card.id))
  console.log(draw.handName)

  const image = getJbCardsImage({ cards: game.cards })
  await writeFile(path.join(__dirname, "jb.png"), image as unknown as string)
}

run()
