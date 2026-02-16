import { getGameOutcomeText } from "./blackjack"

describe("getGameOutcomeText()", () => {
  it("should return 'Bust, you lost' if the player has busted", () => {
    const result = getGameOutcomeText({
      playerMainHand: { playerHasBusted: true, playerHasBlackjack: false },
      dealerHasBusted: false,
      dealerHasBlackjack: false,
      receivedAmount: -100,
    })
    expect(result).toBe("Bust, you lost")
  })

  it("should return 'Dealer bust, you won' if the dealer has busted", () => {
    const result = getGameOutcomeText({
      playerMainHand: { playerHasBusted: false, playerHasBlackjack: false },
      dealerHasBusted: true,
      dealerHasBlackjack: false,
      receivedAmount: 100,
    })
    expect(result).toBe("Dealer bust, you won")
  })

  it("should return 'Double blackjack, you won' if the player has double blackjack", () => {
    const result = getGameOutcomeText({
      playerMainHand: { playerHasBusted: false, playerHasBlackjack: true },
      playerSplitHand: { playerHasBusted: false, playerHasBlackjack: true },
      dealerHasBusted: false,
      dealerHasBlackjack: false,
      receivedAmount: 200,
    })
    expect(result).toBe("Double blackjack, you won")
  })

  it("should return 'Draw, both have blackjack' if both the player and the dealer have blackjack", () => {
    const result = getGameOutcomeText({
      playerMainHand: { playerHasBusted: false, playerHasBlackjack: true },
      dealerHasBusted: false,
      dealerHasBlackjack: true,
      receivedAmount: 0,
    })
    expect(result).toBe("Draw, both have blackjack")
  })

  it("should return 'Dealer blackjack, you lost' if the dealer has blackjack", () => {
    const result = getGameOutcomeText({
      playerMainHand: { playerHasBusted: false, playerHasBlackjack: false },
      dealerHasBusted: false,
      dealerHasBlackjack: true,
      receivedAmount: -100,
    })
    expect(result).toBe("Dealer blackjack, you lost")
  })

  it("should return 'Blackjack, you won' if the player has blackjack", () => {
    const result = getGameOutcomeText({
      playerMainHand: { playerHasBusted: false, playerHasBlackjack: true },
      dealerHasBusted: false,
      dealerHasBlackjack: false,
      receivedAmount: 150,
    })
    expect(result).toBe("Blackjack, you won")
  })
})
