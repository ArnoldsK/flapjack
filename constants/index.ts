export enum Unicode {
  /** @deprecated */
  credits = "❈",
  middot = "·",
  zeroWidthSpace = "​",
  thinSpace = " ",
  enSpace = " ",
  longDash = "—",
}

// prettier-ignore
export enum Color {
  white = 0xFF_FF_FF,
  black = 0x00_00_00,
  red = 0xF0_47_47,
  green = 0x43_B5_81,
  blue = 0x64_95_ED,
  gold = 0xFF_D7_00,
  orange = 0xFF_A5_00,
  purple = 0x77_11_77,
}

export enum Emoji {
  computer = "🖥️",
  chick = "🐤",
  cross = "❌",
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

export const PERSISTENT_THREAD_ARCHIVE_DURATION = 10_080 // 7 days in minutes

export const DISCORD_IDS = {
  guild: "411593263615836172",
  roles: {
    nitroBooster: "611953929835643024",
    upperClass: "1159244242074468503",
    activeMember: "669608043713003521",
    poe: "1354946502589550673",
    rs: "1429400331640639578",
  },
  users: {
    owner: "221755442513051649", // Bot owner
  },
  categories: {
    archive: "525995353821151242",
    moderation: "625639453867900938",
  },
  channels: {
    announcements: "1119330218524540929",
    general: "411593264211296258",
    bepsi: "414516218767081474",
    casino: "621834853696143360",
    nsfw: "632985833414066176",
    logs: "546830997983854592",
    upperClass: "868434446502723625",
    runescape: "717772755508002816",
    copyPasta: "673897295598845952",
    vTubers: "829428335288516619",
    numbersGame: "831055945022963742",
    minecraft: "584768527454568448",
    poe: "701811325042688070",
    videos: "581643451419066368",
    garage: "743552656043409445",
    irl: "673915317981806632",
    auto: "480512533002977280",
    technology: "542127415359438872",
    movies: "754467586858549339",
    animals: "712321839552135191",
    politics: "506149453669990410",
    estate: "596635737521258497",
    money: "779074606698987541",
    food: "813862080742293544",
    health: "522702028426969098",
    weeb: "651437616583016459",
    games: "441322984410578954",
  },
}

export const RECAP_CHANNEL_IDS = [
  DISCORD_IDS.channels.general,
  DISCORD_IDS.channels.bepsi,
  DISCORD_IDS.channels.irl,
  DISCORD_IDS.channels.auto,
  DISCORD_IDS.channels.technology,
  DISCORD_IDS.channels.movies,
  DISCORD_IDS.channels.animals,
  DISCORD_IDS.channels.politics,
  DISCORD_IDS.channels.estate,
  DISCORD_IDS.channels.money,
  DISCORD_IDS.channels.food,
  DISCORD_IDS.channels.health,
  DISCORD_IDS.channels.weeb,
  DISCORD_IDS.channels.games,
]

export const RECAP_PRIVATE_CHANNEL_IDS = [
  DISCORD_IDS.channels.irl,
  DISCORD_IDS.channels.weeb,
]
