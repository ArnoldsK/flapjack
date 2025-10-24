export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

export const assertUnreachable = (_arg: never): void => {
  throw new Error("Argument should be unreachable")
}

export const checkUnreachable = (_arg: never): void => {}
