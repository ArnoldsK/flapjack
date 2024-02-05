import { BaseCommand } from "../base/Command"

import AvatarCommand from "./Avatar"
import MagikCommand from "./Magik"
import PingCommand from "./Ping"
import ArchiveCommand from "./Archive"
import ClearCommand from "./Clear"
import ColorCommand from "./Color"
import EightBallCommand from "./EightBall"
import MockCommand from "./Mock"
import RecapCommand from "./Recap"
import UserInfoCommand from "./UserInfo"
import CreditsCommand from "./Credits"

export const commands: Array<typeof BaseCommand> = [
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
]
