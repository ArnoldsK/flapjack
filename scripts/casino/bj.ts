import { Game, actions } from "engine-blackjack-ts"

const STAGE_READY = "ready"
const STAGE_PLAYER_TURN_RIGHT = "player-turn-right"
const STAGE_PLAYER_TURN_LEFT = "player-turn-left"
const STAGE_SHOWDOWN = "showdown"
const STAGE_DEALER_TURN = "dealer-turn"
const STAGE_DONE = "done"

const execute = (amount: number) => {
  const game = new Game(undefined, {
    decks: 1,
    standOnSoft17: true,
    double: "any",
    split: true,
    doubleAfterSplit: true,
    surrender: true,
    insurance: false,
    showdownAfterAceSplit: true,
  })

  while (game.getState().stage !== STAGE_DONE) {
    const state = game.getState()

    switch (state.stage) {
      case STAGE_READY: {
        game.dispatch(actions.deal({ bet: amount }))
        break
      }
      case STAGE_PLAYER_TURN_RIGHT: {
        const hand = state.handInfo.right
        if (hand.playerValue.hi < 17) {
          game.dispatch(actions.hit({ position: "right" }))
        } else {
          game.dispatch(actions.stand({ position: "right" }))
        }
        break
      }
      case STAGE_PLAYER_TURN_LEFT: {
        const hand = state.handInfo.left
        if (hand.playerValue.hi < 17) {
          game.dispatch(actions.hit({ position: "left" }))
        } else {
          game.dispatch(actions.stand({ position: "left" }))
        }
        break
      }
      case STAGE_SHOWDOWN: {
        break
      }
      case STAGE_DEALER_TURN: {
        break
      }
      case STAGE_DONE: {
        break
      }
    }
  }

  const state = game.getState()
  const wonAmount = state.wonOnLeft + state.wonOnRight

  return wonAmount
}

const run = async () => {
  const count = 1_000_000
  let winCount = 0
  let lossCount = 0
  let total = 0
  let lowest = 0

  for (let i = 0; i < count; i++) {
    const winAmount = execute(1)

    total += winAmount - 1

    if (total < lowest) {
      lowest = total
    }

    if (winAmount > 0) {
      winCount++
    } else {
      lossCount++
    }
  }

  console.log(`${count}x runs`)
  console.log(`credits: ${total} (starting from 0, betting 1)`)
  console.log(`lowest: ${lowest} (consecutive losses)`)
  console.log(`${winCount} wins (${Math.round((winCount / count) * 100)}%)`)
  console.log(`${lossCount} losses (${Math.round((lossCount / count) * 100)}%)`)
}

run()
