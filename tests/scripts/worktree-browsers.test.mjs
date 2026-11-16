import assert from "node:assert/strict";
import { test } from "node:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  exportBrowserEnvironment,
  prepareBrowsers,
} from "../../scripts/worktree-browsers.mjs";

test("setup reruns the installer and removes legacy worktree browser copies", (t) => {
  const root = mkdtempSync(join(tmpdir(), "scalonet-browsers-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const name of ["browsers", "puppeteer", "postgres"]) {
    mkdirSync(join(root, ".local", name), { recursive: true });
    writeFileSync(join(root, ".local", name, "file"), name);
  }
  let installs = 0;
  prepareBrowsers(root, () => installs++);
  prepareBrowsers(root, () => installs++);
  assert.equal(installs, 2);
  assert.equal(existsSync(join(root, ".local/browsers")), false);
  assert.equal(existsSync(join(root, ".local/puppeteer")), false);
  assert.equal(
    readFileSync(join(root, ".local/postgres/file"), "utf8"),
    "postgres",
  );
});

test("exports prefer a configured browser, then Linux Google Chrome, then Playwright Chromium", () => {
  const chrome = "/opt/google/chrome/chrome";
  const chromium = "/cache/ms-playwright/chromium/chrome";
  const installed = (path) => path === chrome;
  const playwright = () => chromium;
  assert.deepEqual(
    exportBrowserEnvironment({}, "linux", installed, playwright),
    { PUPPETEER_EXECUTABLE_PATH: chrome },
  );
  assert.deepEqual(
    exportBrowserEnvironment(
      { PUPPETEER_EXECUTABLE_PATH: "/custom/chrome" },
      "linux",
      installed,
      playwright,
    ),
    {},
  );
  assert.deepEqual(
    exportBrowserEnvironment({}, "linux", () => false, playwright),
    { PUPPETEER_EXECUTABLE_PATH: chromium },
  );
  assert.deepEqual(
    exportBrowserEnvironment({}, "darwin", installed, playwright),
    { PUPPETEER_EXECUTABLE_PATH: chromium },
  );
});

test("the default Chromium is Playwright's full browser, not the headless shell", () => {
  const { PUPPETEER_EXECUTABLE_PATH } = exportBrowserEnvironment(
    {},
    "linux",
    () => false,
  );
  assert.match(PUPPETEER_EXECUTABLE_PATH, /chromium-\d+/);
  assert.doesNotMatch(PUPPETEER_EXECUTABLE_PATH, /headless/);
});
