import { EventTask } from "~/server/utils/event"
import { importDirectoryDefaults } from "~/server/utils/import"

export const getEvents = () =>
  importDirectoryDefaults<EventTask<any>>(__dirname)
