import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
  globalIgnores([
    ".local/**",
    ".vercel/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);
