/** @type {import('jest').Config} */
const config = {
  verbose: true,
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/$1",
  },
}

module.exports = config
