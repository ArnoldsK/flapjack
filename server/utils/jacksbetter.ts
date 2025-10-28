import { assert } from "~/server/utils/error"
import { randomInt } from "~/server/utils/random"

// Imagine not using TypeScript?
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PokerSolver = require("pokersolver")

interface PokerSolverCard {
  value: string
  suit: string
}

interface PokerSolverWinner {
  name: string
  descr: string
  cards: PokerSolverCard[]
}

export interface JbCard {
  /** PokerSolver format, e.g., "Qh", "Td" */
  id: string
  /** Display value, e.g., "Q", "10" */
  value: string
  suit: "hearts" | "diamonds" | "clubs" | "spades"
  /** Whether the card is held for draw */
  isHeld: boolean
}

enum HandName {
  RoyalFlush = "Royal Flush",
  StraightFlush = "Straight Flush",
  FourOfAKind = "Four of a Kind",
  FullHouse = "Full House",
  Flush = "Flush",
  Straight = "Straight",
  ThreeOfAKind = "Three of a Kind",
  TwoPairs = "Two Pairs",
  JacksOrBetter = "Jacks or Better",
}

const PAY_TABLE = new Map<HandName, number>([
  [HandName.RoyalFlush, 4000],
  [HandName.StraightFlush, 250],
  [HandName.FourOfAKind, 125],
  [HandName.FullHouse, 45],
  [HandName.Flush, 30],
  [HandName.Straight, 20],
  [HandName.ThreeOfAKind, 15],
  [HandName.TwoPairs, 10],
  [HandName.JacksOrBetter, 5],
])

const CARD_VALUES = new Set([
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
])

const CARD_JACK_VALUES = new Set(["J", "Q", "K", "A"])

const CARD_SUITS = new Set(["h", "c", "d", "s"])

const CARD_SUIT_NAME = new Map<string, JbCard["suit"]>([
  ["c", "clubs"],
  ["d", "diamonds"],
  ["h", "hearts"],
  ["s", "spades"],
])

export class JacksBetter {
  #id: number

  #bet: number

  #deck: JbCard[] = []

  #cards: JbCard[] = []

  constructor() {
    this.#id = Date.now()
  }

  get id() {
    return this.#id
  }

  get bet() {
    return this.#bet
  }

  get cards() {
    return [...this.#cards] // Clone to prevent mutating
  }

  get cardsHandName(): HandName | null {
    const cardIds = this.#cards.map((card) => card.id)
    const hand = PokerSolver.Hand.solve(cardIds, "jacksbetter")

    // Inject RoyalFlush as it's not there by default
    hand.game.handValues.unshift(PokerSolver.RoyalFlush)

    const [winner] = PokerSolver.Hand.winners([hand]) as PokerSolverWinner[]

    return this.#getWinnerHandName(winner)
  }

  deal({ bet }: { bet: number }) {
    this.#bet = bet

    this.#resetDeck()
    this.#dealCards()
  }

  setCardHold(id: string, isHeld: boolean) {
    const cardIndex = this.#cards.findIndex((card) => card.id === id)
    assert(cardIndex !== -1, `Card ${id} not found`)

    // ! Mutate the card
    this.#cards[cardIndex].isHeld = isHeld
  }

  draw() {
    assert(this.#cards.length === 5, "Not enough cards to draw")

    this.#drawNewCards()

    const handName = this.cardsHandName
    const winMulti = handName ? PAY_TABLE.get(handName)! : 0

    return {
      cards: this.#cards,
      isWin: winMulti > 0,
      winMulti,
      betAmount: this.#bet,
      winAmount: this.#bet * winMulti,
      handName,
    }
  }

  #resetDeck() {
    this.#deck = []
    for (const value of CARD_VALUES) {
      for (const suit of CARD_SUITS) {
        this.#deck.push({
          id: `${value}${suit}`,
          value: value === "T" ? `10` : value,
          suit: CARD_SUIT_NAME.get(suit)!,
          isHeld: false,
        })
      }
    }
  }

  #dealCards() {
    assert(this.#cards.length === 0, "Can't deal over existing cards")

    for (let i = 0; i < 5; i++) {
      this.#cards.push(this.#takeDeckCard())
    }
  }

  #drawNewCards() {
    for (const [i, card] of this.#cards.entries()) {
      if (!card.isHeld) {
        this.#cards[i] = this.#takeDeckCard()
      }
    }
  }

  #takeDeckCard() {
    assert(this.#deck.length > 0, "The deck is empty")

    const takeIndex = randomInt(0, this.#deck.length - 1)
    const [card] = this.#deck.splice(takeIndex, 1)
    assert(!!card, "Could not take a card")

    return card
  }

  #getWinnerHandName(winner: PokerSolverWinner): HandName | null {
    switch (winner.name) {
      case "Straight Flush": {
        if (winner.descr === "Royal Flush") {
          return HandName.RoyalFlush
        }
        return HandName.StraightFlush
      }
      case "Four of a Kind": {
        return HandName.FourOfAKind
      }
      case "Full House": {
        return HandName.FullHouse
      }
      case "Flush": {
        return HandName.Flush
      }
      case "Straight": {
        return HandName.Straight
      }
      case "Three of a Kind": {
        return HandName.ThreeOfAKind
      }
      case "Two Pair": {
        return HandName.TwoPairs
      }
      case "Pair": {
        if (!CARD_JACK_VALUES.has(winner.cards[0]!.value)) {
          break
        }
        return HandName.JacksOrBetter
      }
    }
    return null
  }
}
