import { BaseContext } from "."

export type Task = (context: BaseContext) => Promise<void>
