import { getPercentageChangeString, scaleToHeight, scaleToMax } from "./number"

test("getPercentageChangeString()", () => {
  expect(
    getPercentageChangeString({
      initial: 10,
      current: 12,
    }),
  ).toBe("+20%")
})

test("scaleToMax()", () => {
  const s = scaleToMax(300, 100, 10)

  expect([s.width, s.height]).toEqual([10, 3])
})

test("scaleToHeight()", () => {
  const s = scaleToHeight(300, 100, 10)

  expect([s.width, s.height]).toEqual([30, 10])
})
