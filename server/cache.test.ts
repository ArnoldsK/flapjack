import { CacheObjectManager } from "./cache"

describe("CacheObjectManager", () => {
  test("set", () => {
    const manager = new CacheObjectManager<string>()
    manager.set("key", "value")
    expect(manager.get("key")).toBe("value")
  })

  test("uns", () => {
    const manager = new CacheObjectManager<string>({
      key: "value",
    })
    manager.uns("key")
    expect(manager.get("key")).toBe(undefined)
  })

  test("flow", () => {
    const global = new CacheObjectManager<string>()
    expect(global.raw()).toEqual({})

    global.set("hello", "world")
    expect(global.raw()).toEqual({ hello: "world" })

    global.uns("hello")
    expect(global.raw()).toEqual({})
  })
})
