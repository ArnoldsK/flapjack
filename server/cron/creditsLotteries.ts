import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  GuildTextBasedChannel,
} from "discord.js"
import { appConfig } from "../config"
import CreditsModel from "../models/Credits"
import { formatCredits } from "../utils/credits"
import { CronTask } from "../utils/cron"
import { randomBool, randomInt, randomValue } from "../utils/random"

const getAmount = (): number => {
  // One in 50 to get a mil
  if (randomBool(50)) {
    return 1_000_000
  }

  return (randomInt(2, 20) / 2) * randomValue([1_000, 10_000])!
}

// TODO make crons a class?
export default {
  description: "Credits lotteries chance",

  expression: "every minute",

  productionOnly: true,

  async execute(client) {
    const guild = client.guilds.cache.get(appConfig.discord.ids.guild)!
    const channel = guild.channels.cache.get(
      appConfig.discord.ids.channels.general,
    ) as GuildTextBasedChannel

    // One in 30th minute chance
    if (!randomBool(30)) return

    const amount = getAmount()

    const row = new ActionRowBuilder<ButtonBuilder>()
    row.addComponents(
      new ButtonBuilder()
        .setCustomId("random-credits-button")
        .setLabel(" ")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("1204533924559065099"),
    )

    const message = await channel.send({ components: [row] })

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 6_000,
    })

    collector.on("collect", (interaction) => {
      interaction.deferUpdate()
    })

    collector.on("end", async (collected) => {
      // Delete the original
      await message.delete()

      // Get at least 2 members
      const members = collected
        .map((el) => guild.members.cache.get(el.user.id))
        .filter(Boolean)

      if (members.length < 2) {
        return
      }

      // Get random member
      const member = randomValue(members)!

      const creditsModel = new CreditsModel(member)
      await creditsModel.addCredits(amount)

      // Send a new message
      await channel.send({
        embeds: [
          {
            description: `${member.displayName} claimed ${formatCredits(
              amount,
            )}`,
            color: member.displayColor,
          },
        ],
      })
    })
  },
} satisfies CronTask
