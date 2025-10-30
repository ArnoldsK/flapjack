export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

export const assertUnreachable = (_arg: never): void => {
  throw new Error("Argument should be unreachable")
}

export const checkUnreachable = (_arg: never): void => {}

export const isInteractionCollectorError = (error: unknown): error is Error => {
  return (
    error instanceof Error && error.name.includes("InteractionCollectorError")
  )
}
