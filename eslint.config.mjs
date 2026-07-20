import js from "@eslint/js";
import globals from "globals";
import markdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";
import prettier from "eslint-plugin-prettier/recommended";
import { importX } from "eslint-plugin-import-x";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js, "import-x": importX },
    extends: ["js/recommended", "import-x/flat/recommended"],
    languageOptions: { globals: globals.node },
    rules: {
      "no-unreachable": "error",
      "eol-last": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],

      "import-x/newline-after-import": ["error", { count: 1, considerComments: true }],
      "import-x/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/*.test.{js,ts}",
            "**/*.*.test.{js,ts}",
            "**/setupTests.{js,ts}",
            "vite.config.js",
            "eslint.config.mjs",
          ],
          optionalDependencies: false,
        },
      ],
    },
  },
  { files: ["**/*.md"], plugins: { markdown }, language: "markdown/gfm", extends: ["markdown/recommended"] },
  prettier,
]);
