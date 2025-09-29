import { d, dSubtractRelative } from "./date"

test("dSubtractRelative", () => {
  const now = d()

  expect(dSubtractRelative("1 week")?.format()).toBe(
    now.subtract(1, "week").format(),
  )
  expect(dSubtractRelative("2 days")?.format()).toBe(
    now.subtract(2, "days").format(),
  )
  expect(dSubtractRelative("-2 days")).toBe(null)
  expect(dSubtractRelative("blah")).toBe(null)
})
