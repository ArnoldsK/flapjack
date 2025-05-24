import { Events } from "discord.js"

import { PERSISTENT_THREAD_ARCHIVE_DURATION } from "~/constants"
import { PersistentThreadModel } from "~/server/db/model/PersistentThread"
import { createEvent } from "~/server/utils/event"

export default createEvent(
  Events.ThreadUpdate,
  { productionOnly: true },
  async (context, _oldThread, newThread) => {
    if (!newThread.archived) return

    // Check if the thread is persistent
    const model = new PersistentThreadModel(context)
    const entity = await model.getByThreadId(newThread.id)
    if (!entity) return

    // Unarchive
    await newThread.setArchived(false)

    // Update the duration
    if (newThread.autoArchiveDuration !== PERSISTENT_THREAD_ARCHIVE_DURATION) {
      await newThread.setAutoArchiveDuration(PERSISTENT_THREAD_ARCHIVE_DURATION)
    }
  },
)
