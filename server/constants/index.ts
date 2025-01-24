export enum Unicode {
  /** @deprecated */
  credits = "❈",
  middot = "·",
  zeroWidthSpace = "​",
  thinSpace = " ",
  enSpace = " ",
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

export const DISCORD_BACKGROUND_COLOR_HEX = "#313338"
export const DISCORD_BACKGROUND_COLOR_LAB: [number, number, number] = [
  21.23, 0.37, -3.45,
]

export const COLOR_ROLE_PREFIX = "Color-"

export const MIN_CREDITS_PER_MESSAGE = 10

export const OPTION_DESCRIPTION_AMOUNT =
  "Amount of credits. Examples: 100; 1.1k; 1.1m; all."

export const CREDITS_BANK_HOURLY_RATE = {
  rate: 5,
  divider: 1000,
}

export const UPPER_CLASS_MESSAGE_CREDITS = 500_000

export const BOOSTER_ICON_ROLE_PREFIX = "Icon-"

export const RANK_ACTIVE_ROLE_LEVEL = 20
export const RANK_MAX_LEVEL = 99

export const EXP_PER_MESSAGE = 1
