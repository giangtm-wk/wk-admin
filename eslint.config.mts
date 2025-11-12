import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  globalIgnores([
    "cache/",
    "dist/",
    "node_modules/",
    "*.config.mts",
    "*.config.ts",
    "*.config.js",
    "*.conf.js",
    "*.min.js",
    "*.preset.js",
    "**/coverage/",
    "**/test-setups.ts"
  ]),
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-non-null-assertion": "warn",
    }
  }
]);
