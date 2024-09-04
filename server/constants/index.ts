export enum Unicode {
  /** @deprecated */
  credits = "❈",
  middot = "·",
  zeroWidthSpace = "​",
  thinSpace = " ",
  longDash = "—",
}

export enum Color {
  white = 0xffffff,
  black = 0x000000,
  red = 0xf04747,
  green = 0x43b581,
  blue = 0x6495ed,
  gold = 0xffd700,
  orange = 0xffa500,
  purple = 0x771177,
}

export const COLOR_ROLE_PREFIX = "Color-"

export const MIN_CREDITS_PER_MESSAGE = 10

export const OPTION_DESCRIPTION_AMOUNT =
  "Amount of credits. Examples: 100; 1.1k; 1.1m; all."

export const CREDITS_BANK_HOURLY_RATE = {
  rate: 5,
  divider: 1000,
}

export const UPPER_CLASS_MESSAGE_CREDITS = 500_000
