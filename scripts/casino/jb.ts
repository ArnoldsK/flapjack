import { writeFile } from "node:fs/promises"
import path from "node:path"

import { getCardsAttachment } from "~/server/canvas/cardsAttachment"
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

  const image = getCardsAttachment({ cards: game.cards, small: false })
  await writeFile(path.join(__dirname, "jb.gif"), image as unknown as string)
}

run()
