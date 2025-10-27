import {
  formatCredits,
  formatCreditsAmount,
  getCreditsEmoji,
  parseCreditsAmount,
} from "~/server/utils/credits"

test("getCreditsEmoji", () => {
  expect(getCreditsEmoji(-100)).toContain("")
  expect(getCreditsEmoji(0)).toContain("")
  expect(getCreditsEmoji(1)).toContain(":Coins1:")
  expect(getCreditsEmoji(2)).toContain(":Coins1:")
  expect(getCreditsEmoji(5000)).toContain(":Coins250:")
  expect(getCreditsEmoji(1_000_000_000)).toContain(":Coins10000:")
  expect(getCreditsEmoji(100_133_287_524)).toContain(":Coins10000:")
})

test("parseCreditsAmount", () => {
  expect(parseCreditsAmount("all", 1000)).toBe(1000)

  expect(parseCreditsAmount("500", 1000)).toBe(500)

  expect(parseCreditsAmount("1k", 1000)).toBe(1000)

  expect(parseCreditsAmount("2.5k", 10_000)).toBe(2500)

  expect(parseCreditsAmount("2.533333333k", 10_000)).toBe(2533)

  expect(parseCreditsAmount("3m", 10_000_000)).toBe(3_000_000)

  expect(parseCreditsAmount("50000", 1000)).toBe(1000)

  expect(parseCreditsAmount("50000", BigInt(1000))).toBe(1000)

  expect(parseCreditsAmount("100133287524", Infinity)).toBe(100_133_287_524)

  expect(parseCreditsAmount("500 100", 1000)).toBe(500)

  expect(() => parseCreditsAmount("a3m", 100)).toThrow()

  expect(() => parseCreditsAmount("invalid", 1000)).toThrow()

  expect(() => parseCreditsAmount("", 1000)).toThrow()

  expect(() => parseCreditsAmount("-100", 1000)).toThrow()

  expect(() => parseCreditsAmount("0", 1000)).toThrow()
})

test("formatCreditsAmount", () => {
  expect(formatCreditsAmount(-100_133_287_524n)).toStrictEqual({
    amount: -100,
    suffix: "B",
  })
  expect(formatCreditsAmount(-123_123)).toStrictEqual({
    amount: -123.1,
    suffix: "K",
  })
  expect(formatCreditsAmount(0)).toStrictEqual({
    amount: 0,
    suffix: null,
  })
  expect(formatCreditsAmount(1)).toStrictEqual({
    amount: 1,
    suffix: null,
  })
  expect(formatCreditsAmount(12)).toStrictEqual({
    amount: 12,
    suffix: null,
  })
  expect(formatCreditsAmount(123)).toStrictEqual({
    amount: 123,
    suffix: null,
  })
  expect(formatCreditsAmount(1123)).toStrictEqual({
    amount: 1123,
    suffix: null,
  })
  expect(formatCreditsAmount(10_000)).toStrictEqual({
    amount: 10,
    suffix: "K",
  })
  expect(formatCreditsAmount(12_123)).toStrictEqual({
    amount: 12.1,
    suffix: "K",
  })
  expect(formatCreditsAmount(123_123)).toStrictEqual({
    amount: 123.1,
    suffix: "K",
  })
  expect(formatCreditsAmount(1_123_123)).toStrictEqual({
    amount: 1.12,
    suffix: "M",
  })
  expect(formatCreditsAmount(10_000_000)).toStrictEqual({
    amount: 10,
    suffix: "M",
  })
  expect(formatCreditsAmount(12_123_123)).toStrictEqual({
    amount: 12.1,
    suffix: "M",
  })
  expect(formatCreditsAmount(123_123_123)).toStrictEqual({
    amount: 123,
    suffix: "M",
  })
  expect(formatCreditsAmount(1_123_123_123)).toStrictEqual({
    amount: 1,
    suffix: "B",
  })
  expect(formatCreditsAmount(12_123_123_123)).toStrictEqual({
    amount: 12,
    suffix: "B",
  })
  expect(formatCreditsAmount(123_123_123_123)).toStrictEqual({
    amount: 123,
    suffix: "B",
  })
  expect(formatCreditsAmount(1_123_123_123_123)).toStrictEqual({
    amount: 1,
    suffix: "T",
  })
  expect(formatCreditsAmount(12_123_123_123_123)).toStrictEqual({
    amount: 12,
    suffix: "T",
  })
})

test("formatCredits", () => {
  expect(formatCredits(100_133_287_524)).toBe(
    "100B <:Coins10000:1204533924559065099>",
  )
  expect(formatCredits(-100_133_287_524)).toBe("-100B")
  expect(formatCredits(-100_133_287_524n)).toBe("-100B")
})
