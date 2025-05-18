import axios from "axios"
import { appConfig } from "~/server/config"

interface FileResponse {
  filename: string
  url: string
}

const getAuthHeaders = () => {
  return {
    Authorization: `${appConfig.hosting.authName} ${appConfig.hosting.authToken}`,
  }
}

export const hostingDeleteAllFiles = async () => {
  const apiUrl = new URL("/f", appConfig.hosting.url)

  await axios.delete(apiUrl.toString(), {
    headers: getAuthHeaders(),
  })
}

export const hostingUploadUrlFile = async (
  files: FileResponse[],
): Promise<FileResponse[]> => {
  const apiUrl = new URL("/dl", appConfig.hosting.url)

  const { data } = await axios.post(apiUrl.toString(), files, {
    headers: getAuthHeaders(),
  })

  return data
}
