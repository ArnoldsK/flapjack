import { Events } from "discord.js"

import { setColorInteractionId } from "~/server/utils/color"
import { createEvent } from "~/server/utils/event"
import { setMemberColorRole } from "~/server/utils/role"

export default createEvent(
  Events.InteractionCreate,
  { productionOnly: false },
  async (context, interaction) => {
    if (!interaction.isButton()) return

    const hex = setColorInteractionId.decode(interaction.customId)
    if (!hex) return

    const member = context.guild().members.cache.get(interaction.user.id)
    if (!member) return

    await setMemberColorRole(member, [hex, null])

    await interaction.reply({
      ephemeral: true,
      content: `Changed your color to ${hex}`,
    })
  },
)
