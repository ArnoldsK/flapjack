import { BaseContext } from "~/types"

export type Task = (context: BaseContext) => Promise<void>
