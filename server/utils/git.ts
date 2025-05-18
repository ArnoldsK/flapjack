import fs from "fs"
import path from "path"
import { assert } from "./error"
import { promisify } from "util"
import { exec } from "child_process"

interface Commit {
  hash: string
  message: string
}

const LAST_COMMIT_HASH_PATH = path.join(process.cwd(), ".last-commit-hash")

export const getNewCommits = async (): Promise<Commit[]> => {
  const { stdout: log } = await promisify(exec)(
    "git log -n 10 --oneline --no-merges --no-decorate",
  )

  if (!log) {
    return []
  }

  // ! Newest first
  const commits = getLogCommits(log)

  if (!commits.length) {
    return []
  }

  const latestHash = commits.at(0)?.hash
  assert(!!latestHash, "Latest hash not found")

  const savedHash = await getFileContents(LAST_COMMIT_HASH_PATH)
  await saveLatestCommitHash(latestHash)

  if (!savedHash) {
    return []
  }

  const savedHashCommitsIndex = commits.findIndex(
    (commit) => commit.hash === savedHash,
  )

  if (savedHashCommitsIndex === -1) {
    return []
  }

  return commits.slice(0, savedHashCommitsIndex)
}

const getLogCommits = (log: string): Commit[] => {
  const logs = log.split("\n")

  return logs.map((line) => {
    const [hash, ...words] = line.split(" ")

    return {
      hash,
      message: words.join(" "),
    }
  })
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
