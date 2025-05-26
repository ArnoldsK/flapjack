import { BaseContext } from "~/types"

export type Task<T = void> = (context: BaseContext) => Promise<T>
