import { FlatCompat } from "@eslint/eslintrc"
import pluginJs from "@eslint/js"
import pluginJest from "eslint-plugin-jest"
import pluginReact from "eslint-plugin-react"
import pluginUnicorn from "eslint-plugin-unicorn"
import globals from "globals"
import tseslint from "typescript-eslint"

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

/** @type {import('eslint').Linter.Config[]} */
const config = [
  { ignores: [".next/**", "dist/**", "public/**", "next.config.js"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginJest.configs["flat/recommended"],
  pluginUnicorn.configs["recommended"],
  ...compat.config({
    extends: ["next"],
    settings: {
      next: {
        rootDir: ".",
      },
    },
  }),
  {
    rules: {
      "no-undef": "error",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          "alphabetize": {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "unicorn/prevent-abbreviations": "off", // this isn't java
      "unicorn/filename-case": "off", // lowercase class files are weird
      "unicorn/consistent-function-scoping": "off", // breaks command builders
      "unicorn/prefer-ternary": ["error", "only-single-line"],
      "unicorn/no-null": "off", // wtf...
      "unicorn/no-array-reduce": "off", // skill issue
      "unicorn/no-array-callback-reference": "off", // typescript will handle it
      "unicorn/no-await-expression-member": "off", // less readable and breaks type infers
      "unicorn/prefer-module": "off", // flapjack lives in the past
      "unicorn/no-array-method-this-argument": "off", // gets confused with MikroORM find()
      "unicorn/no-nested-ternary": "off", // prettier format conflict
      "unicorn/no-negated-condition": "off", // not a fan of `canAfford ? null : "Buy"` look
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "no-console": "error",
    },
  },
]

export default config
