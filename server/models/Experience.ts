import { GuildMember } from "discord.js"
import { Repository } from "typeorm"
import { db } from "../database"
import ExperienceEntity from "../entity/Experience"
import { MemberRankData } from "../types/experience"
import { getExpRankLevelData } from "../utils/experience"
import { RANK_ACTIVE_ROLE_LEVEL } from "../constants"
import { sendRankUpMessage } from "../utils/message"
import { addActiveMemberRole } from "../utils/member"
import { sleep } from "../utils/promise"

export class ExperienceModel {
  #member: GuildMember
  #repository: Repository<ExperienceEntity>

  constructor(member: GuildMember) {
    if (member.user.bot) {
      throw new Error("Not allowed for bots")
    }

    this.#member = member
    this.#repository = db.getRepository(ExperienceEntity)
  }

  async getExp() {
    const entity = await this.#repository.findOne({
      where: {
        userId: this.#member.id,
      },
    })

    return entity?.exp ?? 0
  }

  async addExp() {
    const exp = await this.getExp()
    const newExp = exp + 1

    // Prevent a race condition before the table auto-updates
    // If the table gets imported and the unique key is not yet set
    await sleep(1_000)

    await this.#repository.upsert(
      [
        {
          userId: this.#member.id,
          exp: newExp,
        },
      ],
      ["userId"],
    )

    const { lvl } = getExpRankLevelData(exp)
    const { lvl: lvlNew } = getExpRankLevelData(newExp)

    if (lvlNew > lvl && lvlNew >= RANK_ACTIVE_ROLE_LEVEL) {
      await sendRankUpMessage(this.#member, lvlNew)
    }

    if (lvlNew >= RANK_ACTIVE_ROLE_LEVEL) {
      await addActiveMemberRole(this.#member)
    }
  }

  async getAllMemberRankData() {
    const entities = await this.#repository.find({
      order: { exp: "desc" },
    })

    const guild = this.#member.guild
    const rankData: MemberRankData[] = []

    let rank = 1
    for (const entity of entities) {
      const member = guild.members.cache.get(entity.userId)
      if (!member) continue

      const levelData = getExpRankLevelData(entity.exp)
      rankData.push({
        member,
        rank,
        levelData,
      })

      rank++
    }

    return rankData
  }
}
