import { existsSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

export function prepareBrowsers(root, install) {
  for (const name of ["browsers", "puppeteer"]) {
    rmSync(resolve(root, ".local", name), { recursive: true, force: true });
  }
  install();
}

const userNamespaceRestrictions = [
  ["/proc/sys/kernel/apparmor_restrict_unprivileged_userns", "1"],
  ["/proc/sys/kernel/unprivileged_userns_clone", "0"],
];

function readKernelSetting(path) {
  try {
    return readFileSync(path, "utf8").trim();
  } catch {
    return undefined;
  }
}

export function exportBrowserEnvironment(
  environment,
  platform = process.platform,
  exists = existsSync,
  playwrightChromium = () =>
    createRequire(import.meta.url)(
      "@playwright/test",
    ).chromium.executablePath(),
  read = readKernelSetting,
) {
  if (environment.PUPPETEER_EXECUTABLE_PATH) return {};
  const system =
    platform === "linux" &&
    ["/opt/google/chrome/chrome"].find((path) => exists(path));
  if (system) return { PUPPETEER_EXECUTABLE_PATH: system };
  const unsandboxed =
    platform === "linux" &&
    environment.PUPPETEER_DANGEROUS_NO_SANDBOX === undefined &&
    userNamespaceRestrictions.some(([path, value]) => read(path) === value);
  return {
    PUPPETEER_EXECUTABLE_PATH: playwrightChromium(),
    ...(unsandboxed && { PUPPETEER_DANGEROUS_NO_SANDBOX: "true" }),
  };
}
