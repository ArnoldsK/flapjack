import { BaseCommand } from "../base/Command"
import { appConfig } from "../config"

import { AvatarCommand } from "./Avatar"
import { MagikCommand } from "./Magik"
import { PingCommand } from "./Ping"
import { ArchiveCommand } from "./Archive"
import { ClearCommand } from "./Clear"
import { ColorCommand } from "./Color"
import { EightBallCommand } from "./EightBall"
import { MockCommand } from "./Mock"
import { RecapCommand } from "./Recap"
import { UserInfoCommand } from "./UserInfo"
import { CreditsCommand } from "./Credits"
import { RouletteCommand } from "./Roulette"
import { TestCommand } from "./Test"
import { NsfwCommand } from "./Nsfw"
import { SlotsCommand } from "./Slots"
import { BlackjackCommand } from "./Blackjack"
import { RsLootCommand } from "./RsLoot"
import { WheelCommand } from "./Wheel"
import { MuteCommand } from "./Mute"
import { RemindCommand } from "./Remind"
import { PollCommand } from "./Poll"
import { SettingCommand } from "./Setting"
import { RsLeagueCommand } from "./RsLeague"
import { BoosterIconCommand } from "./BoosterIcon"
import { RankCommand } from "./Rank"

export const commands: Array<typeof BaseCommand> = [
  ...(appConfig.dev ? [TestCommand] : []),
  AvatarCommand,
  PingCommand,
  MagikCommand,
  ArchiveCommand,
  ClearCommand,
  ColorCommand,
  EightBallCommand,
  MockCommand,
  RecapCommand,
  UserInfoCommand,
  CreditsCommand,
  RouletteCommand,
  NsfwCommand,
  SlotsCommand,
  BlackjackCommand,
  RsLootCommand,
  RsLeagueCommand,
  WheelCommand,
  MuteCommand,
  RemindCommand,
  PollCommand,
  SettingCommand,
  BoosterIconCommand,
  RankCommand,
].filter(Boolean)
