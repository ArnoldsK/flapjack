import { getPercentageChangeString, toFixedDecimals } from "./number"

test("getPercentageChangeString()", () => {
  expect(
    getPercentageChangeString({
      initial: 10,
      current: 12,
    }),
  ).toBe("+20%")
})

test("toFixedDecimals()", () => {
  expect(toFixedDecimals(99.999, 1)).toBe(99.9)
  expect(toFixedDecimals(0, 1)).toBe(0)
})
