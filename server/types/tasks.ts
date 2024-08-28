import OpenAI from "openai"
import { BaseContext } from "."

export type Task = (context: BaseContext) => Promise<void>

export type AiTask = (context: BaseContext, ai: OpenAI) => Promise<void>
