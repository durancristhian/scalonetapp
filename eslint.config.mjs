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
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    ignores: ["components/team-export/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/*.module.css",
                "**/*.module.scss",
                "**/*.module.sass",
                "**/*.module.less",
              ],
              message:
                "Use Tailwind for application UI. CSS Modules are reserved for the shared composition in components/team-export.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/team-export/**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex:
                "^(?!\\./[^/]+\\.module\\.css$|@/components/team-export/[^/]+\\.module\\.css$).*\\.module\\.(css|scss|sass|less)$",
              message:
                "The shared export composition may only import its own CSS Modules.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".local/**",
    ".vercel/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);
