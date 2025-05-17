import { ApiRecap } from "../../../types/api"
import { WeekRecapData } from "../../../types/recap"

export interface RecapScreenProps {
  recap: ApiRecap["recap"]
  membersData: ApiRecap["members"]
}

export type RecapMessage = WeekRecapData["messages"][number]

export interface MessagesByChannel {
  channel: RecapMessage["channel"]
  messages: RecapMessage[]
}
