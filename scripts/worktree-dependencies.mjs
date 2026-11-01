import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  constants,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, resolve } from "node:path";

export function dependencyFingerprint(root) {
  const hash = createHash("sha256");
  hash.update(
    JSON.stringify([process.version, process.platform, process.arch]),
  );
  for (const name of ["package.json", "package-lock.json", ".npmrc"]) {
    hash.update(name);
    hash.update(
      existsSync(resolve(root, name)) ? readFileSync(resolve(root, name)) : "",
    );
  }
  return hash.digest("hex");
}

const marker = "node_modules/.worktree-install.json";

export function reusableInstallation(root, fingerprint) {
  try {
    const stamp = JSON.parse(readFileSync(resolve(root, marker), "utf8"));
    const installedLock = readFileSync(
      resolve(root, "node_modules/.package-lock.json"),
    );
    const packages = JSON.parse(installedLock).packages;
    return (
      packages &&
      Object.keys(packages).every((path) =>
        existsSync(resolve(root, path, "package.json")),
      ) &&
      !lstatSync(resolve(root, "node_modules")).isSymbolicLink() &&
      stamp.fingerprint === fingerprint &&
      stamp.installedLock ===
        createHash("sha256").update(installedLock).digest("hex")
    );
  } catch {
    return false;
  }
}

function stampInstallation(root, fingerprint) {
  writeFileSync(
    resolve(root, marker),
    JSON.stringify({
      fingerprint,
      installedLock: createHash("sha256")
        .update(readFileSync(resolve(root, "node_modules/.package-lock.json")))
        .digest("hex"),
    }),
  );
}

function copyInstallation(source, destination, fingerprint) {
  rmSync(resolve(destination, "node_modules"), {
    recursive: true,
    force: true,
  });
  cpSync(
    resolve(source, "node_modules"),
    resolve(destination, "node_modules"),
    {
      recursive: true,
      filter: (path) => path !== resolve(source, marker),
      verbatimSymlinks: true,
      mode: constants.COPYFILE_FICLONE,
    },
  );
  stampInstallation(destination, fingerprint);
}

function cachedInstallation(bucket, fingerprint) {
  if (!existsSync(bucket)) return;
  return readdirSync(bucket)
    .filter((name) => name.startsWith("ready-"))
    .map((name) => resolve(bucket, name))
    .find((path) => reusableInstallation(path, fingerprint));
}

function cacheInstallation(root, bucket, fingerprint) {
  if (cachedInstallation(bucket, fingerprint)) return;
  mkdirSync(bucket, { recursive: true, mode: 0o700 });
  const pending = mkdtempSync(resolve(bucket, ".pending-"));
  try {
    copyInstallation(root, pending, fingerprint);
    if (!reusableInstallation(pending, fingerprint)) {
      throw new Error(
        "Dependency installation is incomplete; cache not published.",
      );
    }
    if (!cachedInstallation(bucket, fingerprint)) {
      renameSync(
        pending,
        resolve(bucket, basename(pending).replace(".pending-", "ready-")),
      );
    }
  } finally {
    rmSync(pending, { recursive: true, force: true });
  }
}

export function prepareDependencies(root, cacheRoot) {
  const modules = resolve(root, "node_modules");
  if (existsSync(modules) && lstatSync(modules).isSymbolicLink()) {
    throw new Error(
      "node_modules must be a worktree-local directory, not a symlink.",
    );
  }
  const fingerprint = dependencyFingerprint(root);
  const bucket = resolve(cacheRoot, fingerprint);
  if (reusableInstallation(root, fingerprint)) {
    cacheInstallation(root, bucket, fingerprint);
    console.log("Reusing worktree dependencies.");
    return;
  }
  const cached = cachedInstallation(bucket, fingerprint);
  if (cached) {
    copyInstallation(cached, root, fingerprint);
    console.log("Copied compatible dependencies from the repository cache.");
  } else {
    console.log("Installing locked dependencies with npm ci.");
    const install = spawnSync(
      "npm",
      ["ci", "--include=dev", "--include=optional"],
      {
        cwd: root,
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 16 * 1024 * 1024,
        env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: "true" },
      },
    );
    if (install.status !== 0) {
      throw new Error(
        "npm ci failed. Check registry access and package-lock.json; installer output withheld to protect configuration.",
      );
    }
    stampInstallation(root, fingerprint);
    cacheInstallation(root, bucket, fingerprint);
  }
}
