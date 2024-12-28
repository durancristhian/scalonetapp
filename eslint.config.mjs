import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
  ],
  allConfig: [
    js.configs.all,
    ...tseslint.configs.all,
    pluginReact.configs.flat.all,
  ],
  languageOptions: { globals: globals.browser },
});
const config = [...compat.extends("next/core-web-vitals")];

/** @type {import('eslint').Linter.Config[]} */
export default config;
