import {
  constants,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  renameSync,
  rmSync,
} from "node:fs";
import { basename, resolve } from "node:path";
import { dependencyFingerprint } from "./worktree-dependencies.mjs";

const directories = ["browsers", "puppeteer"];

function snapshot(bucket) {
  if (!existsSync(bucket)) return;
  return readdirSync(bucket)
    .filter((name) => name.startsWith("ready-"))
    .map((name) => resolve(bucket, name))
    .find((path) =>
      directories.every((name) => existsSync(resolve(path, name))),
    );
}

function copyBrowsers(source, destination, missingOnly = false) {
  for (const name of directories) {
    const from = resolve(source, name);
    if (
      !existsSync(from) ||
      (missingOnly && existsSync(resolve(destination, name)))
    )
      continue;
    cpSync(from, resolve(destination, name), {
      recursive: true,
      verbatimSymlinks: true,
      mode: constants.COPYFILE_FICLONE,
      filter: (path) => ![".links", "__dirlock"].includes(basename(path)),
    });
  }
}

export function prepareBrowsers(root, cacheRoot, install) {
  const local = resolve(root, ".local");
  const bucket = resolve(cacheRoot, dependencyFingerprint(root));
  const cached = snapshot(bucket);
  if (cached) {
    for (const name of directories) {
      if (!existsSync(resolve(local, name))) {
        copyBrowsers(cached, local, true);
        console.log("Copied compatible browsers from the repository cache.");
        break;
      }
    }
  }
  install();
  if (cached || snapshot(bucket)) return;
  if (!directories.every((name) => existsSync(resolve(local, name)))) return;
  mkdirSync(bucket, { recursive: true, mode: 0o700 });
  const pending = mkdtempSync(resolve(bucket, ".pending-"));
  try {
    copyBrowsers(local, pending);
    if (!snapshot(bucket)) {
      renameSync(
        pending,
        resolve(bucket, basename(pending).replace(".pending-", "ready-")),
      );
    }
  } finally {
    rmSync(pending, { recursive: true, force: true });
  }
}
