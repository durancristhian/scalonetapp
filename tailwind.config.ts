import type { Config } from "tailwindcss";

const config = {
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  darkMode: ["class"],
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
