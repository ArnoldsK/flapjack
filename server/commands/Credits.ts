import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { checkUnreachable } from "../utils/error"
import { formatCredits, parseCreditsAmount } from "../utils/credits"
import CreditsModel from "../models/Credits"
import { sortBigInt } from "../utils/array"
import { OPTION_DESCRIPTION_AMOUNT } from "../constants"
import { isCasinoChannel } from "../utils/channel"

enum SubcommandName {
  View = "view",
  Give = "give",
  Top = "top",
}

enum OptionName {
  User = "user",
  Amount = "amount",
}

export default class CreditsCommand extends BaseCommand {
  static version = 3

  static command = new SlashCommandBuilder()
    .setName("credits")
    .setDescription("Manage your credits")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.View)
        .setDescription("View your credits")
        .addUserOption((option) =>
          option
            .setName(OptionName.User)
            .setDescription("View other user credits"),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Give)
        .setDescription("Give credits to someone")
        .addUserOption((option) =>
          option
            .setName(OptionName.User)
            .setDescription("User to give credits to")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName(OptionName.Amount)
            .setDescription(OPTION_DESCRIPTION_AMOUNT)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Top)
        .setDescription("Get credits top list"),
    )

  async execute() {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.View:
        await this.#handleView()
        break

      case SubcommandName.Give:
        await this.#handleGive()
        break

      case SubcommandName.Top:
        await this.#handleTop()
        break

      default:
        checkUnreachable(subcommand)
    }
  }

  async #handleView() {
    const user = this.interaction.options.getUser(OptionName.User) ?? this.user

    const member = this.guild.members.cache.get(user.id)
    if (!member) {
      this.fail("User not found")
      return
    }

    const isSelf = user.id === this.user.id
    const intro = isSelf ? "You have" : `${member.displayName} has`

    const creditsModel = new CreditsModel(member)
    const wallet = await creditsModel.getWallet()

    this.reply({
      ephemeral: !isCasinoChannel(this.channel),
      embeds: [
        {
          color: member.displayColor,
          description: `**${intro} ${formatCredits(wallet.credits)}**`,
        },
      ],
    })
  }

  async #handleGive() {
    const targetUser = this.interaction.options.getUser(OptionName.User, true)
    const targetMember = this.guild.members.cache.get(targetUser.id)
    if (!targetMember) {
      this.fail("User not found")
      return
    }

    const isSelf = targetUser.id === this.user.id
    if (isSelf) {
      this.fail("Can't give to yourself")
      return
    }

    const creditsModel = new CreditsModel(this.member)
    const wallet = await creditsModel.getWallet()

    const rawAmount = this.interaction.options.getString(
      OptionName.Amount,
      true,
    )
    const amount = parseCreditsAmount(rawAmount, wallet.credits)

    const targetCreditsModel = new CreditsModel(targetMember)
    await targetCreditsModel.addCredits(amount)
    await creditsModel.addCredits(-amount)

    this.reply({
      embeds: [
        {
          color: this.member.displayColor,
          description: `Gave ${formatCredits(amount)} to ${
            targetMember.displayName
          }`,
        },
      ],
    })
  }

  async #handleTop() {
    const creditsModel = new CreditsModel(this.member)
    const wallets = await creditsModel.getAllWallets()

    this.reply({
      ephemeral: !isCasinoChannel(this.channel),
      embeds: [
        {
          fields: wallets
            .map((wallet) => ({
              member: wallet.member,
              amount: wallet.credits,
            }))
            .sort((a, b) => sortBigInt(b.amount, a.amount))
            .slice(0, 9)
            .map(({ member, amount }, i) => ({
              name: `#${i + 1} ${member.displayName}`,
              value: formatCredits(amount),
              inline: true,
            })),
        },
      ],
    })
  }
}
