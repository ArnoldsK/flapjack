import { JacksBetter } from "~/server/utils/jacksbetter"

const run = async () => {
  const game = new JacksBetter()

  game.deal({ bet: 5 })

  console.log("Cards:", game.cards)

  console.log("Hold first card")
  game.setCardHold(game.cards[0]!.id, true)

  const draw = game.draw()

  console.log(draw)
}

run()
