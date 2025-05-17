import { appConfig } from "../config"

export const getUrl = (path: string = ""): string => {
  let baseUrl = appConfig.web.baseUrl

  if (!baseUrl.endsWith("/")) {
    baseUrl += "/"
  }

  return baseUrl + path
}

export const isUrl = (string: string): boolean =>
  new RegExp(
    "^([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?$",
    "i",
  ).test(string)

export const isDiscordAttachmentUrl = (value: string): boolean => {
  try {
    const url = new URL(value)

    return (
      (url.hostname === "cdn.discordapp.com" ||
        url.hostname === "media.discordapp.net") &&
      url.pathname.startsWith("/attachments")
    )
  } catch {
    return false
  }
}
