import { getCreditsEmoji, parseCreditsAmount } from "./credits"

test("getCreditsEmoji", () => {
  expect(getCreditsEmoji(0)).toContain("")
  expect(getCreditsEmoji(1)).toContain(":Coins1:")
  expect(getCreditsEmoji(2)).toContain(":Coins1:")
  expect(getCreditsEmoji(5000)).toContain(":Coins250:")
  expect(getCreditsEmoji(1000000000)).toContain(":Coins10000:")
})

test("parseCreditsAmount", () => {
  expect(parseCreditsAmount("all", 1_000)).toBe(1_000)

  expect(parseCreditsAmount("500", 1_000)).toBe(500)

  expect(parseCreditsAmount("1k", 1_000)).toBe(1_000)

  expect(parseCreditsAmount("2.5k", 10_000)).toBe(2_500)

  expect(parseCreditsAmount("2.533333333k", 10_000)).toBe(2_533)

  expect(parseCreditsAmount("3m", 10_000_000)).toBe(3_000_000)

  expect(parseCreditsAmount("50000", 1_000)).toBe(1_000)

  expect(parseCreditsAmount("50000", BigInt(1_000))).toBe(1_000)

  expect(parseCreditsAmount("500 100", 1_000)).toBe(500)

  expect(() => parseCreditsAmount("a3m", 100)).toThrow()

  expect(() => parseCreditsAmount("invalid", 1_000)).toThrow()

  expect(() => parseCreditsAmount("", 1_000)).toThrow()

  expect(() => parseCreditsAmount("-100", 1_000)).toThrow()

  expect(() => parseCreditsAmount("0", 1_000)).toThrow()
})
