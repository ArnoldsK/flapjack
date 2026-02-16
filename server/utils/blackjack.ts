import { Hand } from "engine-blackjack-ts"

export const getGameOutcomeText = ({
  playerMainHand,
  playerSplitHand,
  dealerHasBusted,
  dealerHasBlackjack,
  receivedAmount,
}: {
  playerMainHand: Pick<Hand, "playerHasBusted" | "playerHasBlackjack">
  playerSplitHand?: Pick<Hand, "playerHasBusted" | "playerHasBlackjack">
  dealerHasBusted: boolean
  dealerHasBlackjack: boolean
  receivedAmount: number
}): string => {
  const bust: boolean =
    playerMainHand.playerHasBusted || !!playerSplitHand?.playerHasBusted
  const hasDoubleBj: boolean =
    playerMainHand.playerHasBlackjack && !!playerSplitHand?.playerHasBlackjack
  const hasBj: boolean =
    playerMainHand.playerHasBlackjack || !!playerSplitHand?.playerHasBlackjack

  if (bust) {
    return "Bust, you lost"
  } else if (dealerHasBusted) {
    return "Dealer bust, you won"
  } else if (hasDoubleBj) {
    return "Double blackjack, you won"
  } else if (hasBj && dealerHasBlackjack) {
    return "Draw, both have blackjack"
  } else if (dealerHasBlackjack) {
    return "Dealer blackjack, you lost"
  } else if (hasBj) {
    return "Blackjack, you won"
  } else {
    if (receivedAmount > 0) {
      return "You won"
    } else if (receivedAmount === 0) {
      return "Draw, you get back"
    } else {
      return "You lost"
    }
  }
}
