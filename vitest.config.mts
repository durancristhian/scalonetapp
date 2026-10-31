import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "jsdom",
    include: ["tests/frontend/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/frontend/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    env: {
      NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL: "5",
      NEXT_PUBLIC_MAX_MATCHES_PER_USER: "100",
    },
  },
});
