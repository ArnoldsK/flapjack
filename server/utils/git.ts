import fs from "fs"
import path from "path"
import { isNonNullish } from "./boolean"
import { assert } from "./error"

interface Commit {
  prevHash: string
  hash: string
  author: string
  email: string
  timestamp: number
  timezoneOffset: string
  message: string
}

const LAST_COMMIT_HASH_PATH = path.join(process.cwd(), ".last-commit-hash")

const LOGS_PATH = path.join(
  process.cwd(),
  ".git",
  "logs",
  "refs",
  "heads",
  "master",
)

export const getNewCommits = async (): Promise<Commit[]> => {
  const logs = await getFileContents(LOGS_PATH)

  if (!logs) {
    return []
  }

  // ! Oldest first
  const commits = logs.split("\n").map(getLogCommit).filter(isNonNullish)

  if (!commits.length) {
    return []
  }

  const latestHash = commits.at(-1)?.hash
  assert(!!latestHash, "Latest hash not found")

  const savedHash = await getFileContents(LAST_COMMIT_HASH_PATH)
  await saveLatestCommitHash(latestHash)

  if (!savedHash) {
    return []
  }

  const lastCommitIndex = commits.findIndex(
    (commit) => commit.hash === savedHash,
  )

  if (lastCommitIndex === -1) {
    return []
  }

  return commits.slice(lastCommitIndex)
}

const saveLatestCommitHash = async (hash: string) => {
  await fs.promises.writeFile(LAST_COMMIT_HASH_PATH, hash)
}

const getFileContents = async (path: string): Promise<string | null> => {
  if (!fs.existsSync(path)) {
    return null
  }
  try {
    const buffer = await fs.promises.readFile(path)
    return buffer.toString()
  } catch {
    return null
  }
}

const getLogCommit = (log: string): Commit | null => {
  if (!log) {
    return null
  }

  const [details, body] = log.split("\t")

  if (!body.startsWith("commit: ")) {
    return null
  }

  const message = body.substring(8)

  const [prevHash, hash, author, email, timestamp, timezoneOffset] =
    details.split(" ")

  return {
    prevHash,
    hash,
    author,
    email,
    timestamp: parseInt(timestamp, 10),
    timezoneOffset,
    message,
  }
}
