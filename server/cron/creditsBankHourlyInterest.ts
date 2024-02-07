import { CREDITS_BANK_HOURLY_RATE } from "../constants"
import CreditsEntity from "../entity/Credits"
import { CronTask } from "../utils/cron"

export default {
  description: "Credits bank hourly interest",

  expression: "every hour",

  async execute() {
    const { rate, divider } = CREDITS_BANK_HOURLY_RATE

    CreditsEntity.createQueryBuilder()
      .update()
      .set({
        banked: () =>
          `banked + (banked * ${BigInt(rate)} / ${BigInt(divider)})`,
      })
      .execute()
  },
} as CronTask
