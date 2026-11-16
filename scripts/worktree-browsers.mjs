import { existsSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

export function prepareBrowsers(root, install) {
  for (const name of ["browsers", "puppeteer"]) {
    rmSync(resolve(root, ".local", name), { recursive: true, force: true });
  }
  install();
}

export function exportBrowserEnvironment(
  environment,
  platform = process.platform,
  exists = existsSync,
  playwrightChromium = () =>
    createRequire(import.meta.url)(
      "@playwright/test",
    ).chromium.executablePath(),
) {
  if (environment.PUPPETEER_EXECUTABLE_PATH) return {};
  const system =
    platform === "linux" &&
    ["/opt/google/chrome/chrome"].find((path) => exists(path));
  return { PUPPETEER_EXECUTABLE_PATH: system || playwrightChromium() };
}
