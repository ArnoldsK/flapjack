import { BaseCommand } from "../base/Command"

import Avatar from "./Avatar"
import Magik from "./Magik"
import Ping from "./Ping"
import Archive from "./Archive"
import Clear from "./Clear"
import Color from "./Color"
import EightBall from "./EightBall"
import Mock from "./Mock"
import Recap from "./Recap"
import UserInfo from "./UserInfo"

export const commands: Array<typeof BaseCommand> = [
  Avatar,
  Ping,
  Magik,
  Archive,
  Clear,
  Color,
  EightBall,
  Mock,
  Recap,
  UserInfo,
]
