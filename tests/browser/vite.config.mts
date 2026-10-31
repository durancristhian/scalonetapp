import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = fileURLToPath(new URL("../..", import.meta.url));
export default defineConfig({
  root: fileURLToPath(new URL("./fixture", import.meta.url)),
  plugins: [react()],
  resolve: { alias: {
    "@/server/actions/player": fileURLToPath(new URL("./fixture/player-actions.ts", import.meta.url)),
    "@": root,
  } },
  define: { "process.env.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL": '"5"' },
  server: { host: "127.0.0.1", port: 4317, strictPort: true, fs: { allow: [root] } },
});
