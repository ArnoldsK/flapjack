import { SlashCommandBuilder } from "discord.js"

import { OPTION_DESCRIPTION_AMOUNT } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { appConfig } from "~/server/config"
import { CreditsModel, Wallet } from "~/server/db/model/Credits"
import { sortBigInt } from "~/server/utils/array"
import { isCasinoChannel } from "~/server/utils/channel"
import { formatCredits, parseCreditsAmount } from "~/server/utils/credits"
import { assert, checkUnreachable } from "~/server/utils/error"

enum SubcommandName {
  View = "view",
  Give = "give",
  Top = "top",
  Adjust = "adjust", // local dev only
}

enum OptionName {
  User = "user",
  Amount = "amount",
}

const addLocalDevSubcommands = (cb: SlashCommandBuilder) => {
  if (appConfig.dev) {
    cb.addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Adjust)
        .setDescription("Adjust user credits")
        .addUserOption((option) =>
          option
            .setName(OptionName.User)
            .setDescription("User to give credits to")
            .setRequired(true),
        )
        .addNumberOption((option) =>
          option
            .setName(OptionName.Amount)
            .setDescription("Exact amount of credits")
            .setRequired(true),
        ),
    )
  }
  return cb
}

export default class CreditsCommand extends BaseCommand {
  static version = 3

  static command = addLocalDevSubcommands(new SlashCommandBuilder())
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

  get isEphemeral(): boolean {
    return (
      !isCasinoChannel(this.channel) ||
      this.getSubcommand() === SubcommandName.Adjust
    )
  }

  async execute() {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.View: {
        await this.#handleView()
        break
      }

      case SubcommandName.Give: {
        await this.#handleGive()
        break
      }

      case SubcommandName.Top: {
        await this.#handleTop()
        break
      }

      case SubcommandName.Adjust: {
        await this.#handleAdjust()
        break
      }

      default: {
        checkUnreachable(subcommand)
      }
    }
  }

  async #handleView() {
    const user = this.interaction.options.getUser(OptionName.User) ?? this.user

    const member = this.guild.members.cache.get(user.id)
    assert(!!member, "Member not found")

    const isSelf = user.id === this.user.id
    const intro = isSelf ? "You have" : `${member.displayName} has`

    const creditsModel = new CreditsModel(this.context)

    let wallet: Wallet
    if (isSelf && isCasinoChannel(this.channel)) {
      wallet = await creditsModel.addMessageCredits({
        userId: this.user.id,
        messageAt: this.interaction.createdAt,
      })
    } else {
      wallet = await creditsModel.getWallet(member.id)
    }

    this.reply({
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
    assert(!!targetMember, "User not found")

    const isSelf = targetUser.id === this.user.id
    assert(!isSelf, "Can't give to yourself")

    const isBot = targetUser.bot
    assert(!isBot, "Can't give to bots")

    const creditsModel = new CreditsModel(this.context)
    const wallet = await creditsModel.getWallet(this.member.id)

    const rawAmount = this.interaction.options.getString(
      OptionName.Amount,
      true,
    )
    const amount = parseCreditsAmount(rawAmount, wallet.credits)

    await creditsModel.modifyCredits({
      userId: targetMember.id,
      byAmount: amount,
      isCasino: false,
    })
    await creditsModel.modifyCredits({
      userId: this.member.id,
      byAmount: -amount,
      isCasino: false,
    })

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
    const creditsModel = new CreditsModel(this.context)
    const wallets = await creditsModel.getAllWallets()

    if (wallets.length === 0) {
      this.reply({
        content: "No one has any credits yet.",
      })
      return
    }

    this.reply({
      embeds: [
        {
          fields: wallets
            .filter((wallet) => !wallet.member.user.bot)
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

  async #handleAdjust() {
    assert(appConfig.dev, "Not on dev env")

    const targetUser = this.interaction.options.getUser(OptionName.User, true)
    const targetMember = this.guild.members.cache.get(targetUser.id)
    assert(!!targetMember, "User not found")

    const rawAmount = this.interaction.options.getNumber(
      OptionName.Amount,
      true,
    )
    const amount = BigInt(rawAmount)

    const creditsModel = new CreditsModel(this.context)
    await creditsModel.modifyCredits({
      userId: targetMember.id,
      byAmount: amount,
      isCasino: false,
    })

    this.reply({
      embeds: [
        {
          color: this.member.displayColor,
          description: `Adjusted by ${formatCredits(amount)} for ${
            targetMember.displayName
          }`,
        },
      ],
    })
  }
}
