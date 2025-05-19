import { AnyEvent, EventTask } from "~/server/utils/event"
import { importDirectoryDefaults } from "~/server/utils/file"

export const getEvents = () =>
  importDirectoryDefaults<EventTask<AnyEvent>>(__dirname)
