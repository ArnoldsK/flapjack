import { Events } from "discord.js"

import { createEvent } from "../utils/event"
import { setColorInteractionId } from "../utils/color"
import { setMemberColorRole } from "../utils/role"

export default createEvent(
  Events.InteractionCreate,
  { productionOnly: false },
  async (context, interaction) => {
    if (!interaction.isButton()) return

    const hex = setColorInteractionId.decode(interaction.customId)
    if (!hex) return

    const member = context.guild().members.cache.get(interaction.user.id)
    if (!member) return

    await setMemberColorRole(member, hex)

    await interaction.reply({
      ephemeral: true,
      content: `Changed your color to ${hex}`,
    })
  },
)
