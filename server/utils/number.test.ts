import { getPercentageChangeString } from "./number"

test("getPercentageChangeString()", () => {
  expect(
    getPercentageChangeString({
      initial: 10,
      current: 12,
    }),
  ).toBe("+20%")
})
