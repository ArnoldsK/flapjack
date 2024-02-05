import { ChannelType, SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { PermissionFlags, permission } from "../utils/permission"
import { Color } from "../constants"
import { appConfig } from "../config"
import { checkUnreachable } from "../utils/error"
import { joinAsLines } from "../utils/string"
import { formatCredits } from "../utils/credits"
import CreditsModel from "../models/Credits"
import { sortBigInt } from "../utils/array"

enum SubcommandName {
  View = "view",
  Give = "give",
  Deposit = "deposit",
  Withdraw = "withdraw",
  Top = "top",
}

enum OptionName {
  User = "user",
  Amount = "amount",
}

export default class CreditsCommand extends BaseCommand {
  static version = 2

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
        .addIntegerOption((option) =>
          option
            .setName(OptionName.Amount)
            .setDescription("Amount of credits to give")
            .setMinValue(1)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Deposit)
        .setDescription("Place credits in the bank")
        .addIntegerOption((option) =>
          option
            .setName(OptionName.Amount)
            .setDescription("Amount of credits to put in the bank")
            .setMinValue(1)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Withdraw)
        .setDescription("Remove credits from the bank")
        .addIntegerOption((option) =>
          option
            .setName(OptionName.Amount)
            .setDescription("Amount of credits to remove from the bank")
            .setMinValue(1)
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
        this.#handleView()
        break

      case SubcommandName.Give:
        this.#handleGive()
        break

      case SubcommandName.Deposit:
        this.#handleBank(SubcommandName.Deposit)
        break

      case SubcommandName.Withdraw:
        this.#handleBank(SubcommandName.Withdraw)
        break

      case SubcommandName.Top:
        this.#handleTop()
        break

      default:
        checkUnreachable(subcommand)
    }
  }

  get #isInCasino() {
    return this.channel.id === appConfig.discord.ids.channels.casino
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
      ephemeral: !this.#isInCasino,
      embeds: [
        {
          color: member.displayColor,
          description: joinAsLines(
            `**${intro} ${formatCredits(wallet.credits)}**`,
            `${formatCredits(wallet.banked)} in the bank`,
          ),
        },
      ],
    })
  }

  async #handleGive() {
    const targetUser = this.interaction.options.getUser(OptionName.User, true)
    const amount = this.interaction.options.getInteger(OptionName.Amount, true)

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

    let finalAmount = Math.abs(amount)
    if (finalAmount > wallet.credits) {
      // ! bigint to number conversion
      finalAmount = Number(wallet.credits)
    }

    if (finalAmount <= 0) {
      this.fail("Nothing to give")
      return
    }

    const targetCreditsModel = new CreditsModel(targetMember)
    await targetCreditsModel.addCredits(finalAmount)
    await creditsModel.addCredits(-finalAmount)

    this.reply({
      embeds: [
        {
          color: this.member.displayColor,
          description: `Gave ${formatCredits(finalAmount)} to ${
            targetMember.displayName
          }`,
        },
      ],
    })
  }

  async #handleBank(action: SubcommandName.Deposit | SubcommandName.Withdraw) {
    const amount = this.interaction.options.getInteger(OptionName.Amount, true)

    const creditsModel = new CreditsModel(this.member)
    const wallet = await creditsModel.getWallet()

    const sourceAmount =
      action === SubcommandName.Deposit ? wallet.credits : wallet.banked

    let finalAmount = Math.abs(amount)
    if (finalAmount > sourceAmount) {
      // ! bigint to number conversion
      finalAmount = Number(sourceAmount)
    }

    if (finalAmount <= 0) {
      this.fail(`Nothing to ${action}`)
      return
    }

    if (action === SubcommandName.Deposit) {
      await creditsModel.addCredits(-finalAmount, finalAmount)
    } else {
      await creditsModel.addCredits(finalAmount, -finalAmount)
    }

    this.reply({
      ephemeral: !this.#isInCasino,
      embeds: [
        {
          color: this.member.displayColor,
          description:
            action === SubcommandName.Deposit
              ? `Put ${formatCredits(finalAmount)} in the bank`
              : `Took ${formatCredits(finalAmount)} from the bank`,
        },
      ],
    })
  }

  async #handleTop() {
    const creditsModel = new CreditsModel(this.member)
    const wallets = await creditsModel.getAllWallets()

    this.reply({
      ephemeral: !this.#isInCasino,
      embeds: [
        {
          fields: wallets
            .map((wallet) => ({
              member: wallet.member,
              amount: wallet.credits + wallet.banked,
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
