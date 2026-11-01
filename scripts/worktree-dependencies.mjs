import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  constants,
  cpSync,
  existsSync,
  lstatSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

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
    return (
      !lstatSync(resolve(root, "node_modules")).isSymbolicLink() &&
      stamp.fingerprint === fingerprint &&
      stamp.installedLock ===
        createHash("sha256")
          .update(
            readFileSync(resolve(root, "node_modules/.package-lock.json")),
          )
          .digest("hex")
    );
  } catch {
    return false;
  }
}

export function prepareDependencies(root, main) {
  const modules = resolve(root, "node_modules");
  if (existsSync(modules) && lstatSync(modules).isSymbolicLink()) {
    throw new Error(
      "node_modules must be a worktree-local directory, not a symlink.",
    );
  }
  const fingerprint = dependencyFingerprint(root);
  if (reusableInstallation(root, fingerprint)) {
    console.log("Reusing worktree dependencies.");
    return;
  }
  if (root !== main && reusableInstallation(main, fingerprint)) {
    rmSync(resolve(root, "node_modules"), { recursive: true, force: true });
    cpSync(resolve(main, "node_modules"), resolve(root, "node_modules"), {
      recursive: true,
      filter: (source) => source !== resolve(main, marker),
      verbatimSymlinks: true,
      mode: constants.COPYFILE_FICLONE,
    });
    console.log("Copied compatible dependencies from the main checkout.");
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
  }
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
