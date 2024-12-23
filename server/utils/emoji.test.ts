import { getEmojiIdFromString, getNativeEmojiFromString } from "./emoji"

test("getEmojiIdFromString", () => {
  expect(getEmojiIdFromString("blah")).toBe(undefined)
  expect(getEmojiIdFromString("<:Dreaming:712788218319339581>")).toBe(
    "712788218319339581",
  )
  expect(getEmojiIdFromString("<a:Dreaming:712788218319339581>")).toBe(
    "712788218319339581",
  )
})

test("getNativeEmojiFromString", () => {
  expect(getNativeEmojiFromString("blah")).toBe(undefined)
  expect(getNativeEmojiFromString("<:Dreaming:712788218319339581>")).toBe(
    undefined,
  )
  expect(getNativeEmojiFromString("😃")).toBe("😃")
})
