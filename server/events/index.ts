import { EventTask } from "../utils/event"
import { importDirectoryDefaults } from "../utils/import"

export const getEvents = () =>
  importDirectoryDefaults<EventTask<any>>(__dirname)
