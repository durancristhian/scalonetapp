import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  symlinkSync,
  chmodSync,
  copyFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  prepareDependencies,
  dependencyFingerprint,
  reusableInstallation,
} from "../../scripts/worktree-dependencies.mjs";

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "scalonet-setup-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const bin = join(directory, "bin");
  mkdirSync(bin);
  const npm = join(bin, "npm");
  writeFileSync(
    npm,
    `#!/usr/bin/env node
const fs = require('node:fs');
fs.mkdirSync('node_modules', {recursive:true});
fs.mkdirSync('node_modules/fixture-package', {recursive:true});
fs.writeFileSync('node_modules/fixture-package/package.json', JSON.stringify({name:'fixture-package',version:'1.0.0'}));
fs.writeFileSync('node_modules/.package-lock.json', JSON.stringify({lockfileVersion:3,packages:{'node_modules/fixture-package':{version:'1.0.0'}}}));
`,
  );
  chmodSync(npm, 0o700);
  const previousPath = process.env.PATH;
  process.env.PATH = `${bin}:${previousPath}`;
  t.after(() => {
    process.env.PATH = previousPath;
  });
  const main = join(directory, "main");
  const target = join(directory, "target");
  for (const root of [main, target]) {
    mkdirSync(root);
    writeFileSync(
      join(root, "package.json"),
      '{"name":"setup-fixture","version":"1.0.0","private":true}',
    );
    writeFileSync(
      join(root, "package-lock.json"),
      '{"name":"setup-fixture","version":"1.0.0","lockfileVersion":3,"packages":{"":{"name":"setup-fixture","version":"1.0.0"}}}',
    );
  }
  return { main, target };
}

test("installs once, copies an independent tree, and reuses it", (t) => {
  const { main, target } = fixture(t);
  prepareDependencies(main, main);
  assert.equal(reusableInstallation(main, dependencyFingerprint(main)), true);
  writeFileSync(join(main, "node_modules", "proof"), "original");
  mkdirSync(join(main, "node_modules", ".bin"));
  symlinkSync("../proof", join(main, "node_modules", ".bin", "proof"));
  prepareDependencies(target, main);
  assert.equal(
    readFileSync(join(target, "node_modules", ".bin", "proof"), "utf8"),
    "original",
  );
  writeFileSync(join(target, "node_modules", "proof"), "changed");
  assert.equal(
    readFileSync(join(main, "node_modules", "proof"), "utf8"),
    "original",
  );
  prepareDependencies(target, main);
  assert.equal(
    readFileSync(join(target, "node_modules", "proof"), "utf8"),
    "changed",
  );
});

test("rejects changed manifests, npm configuration and installed lock", (t) => {
  const { main } = fixture(t);
  prepareDependencies(main, main);
  const fingerprint = dependencyFingerprint(main);
  for (const name of ["package.json", "package-lock.json", ".npmrc"]) {
    const path = join(main, name);
    const original = name === ".npmrc" ? null : readFileSync(path);
    writeFileSync(path, name === ".npmrc" ? "ignore-scripts=true" : "changed");
    assert.notEqual(dependencyFingerprint(main), fingerprint);
    assert.equal(
      reusableInstallation(main, dependencyFingerprint(main)),
      false,
    );
    if (original) writeFileSync(path, original);
    else rmSync(path);
  }
  writeFileSync(join(main, "node_modules", ".package-lock.json"), "changed");
  assert.equal(reusableInstallation(main, fingerprint), false);
});

test("rejects missing, corrupt, foreign-runtime and symlinked installations", (t) => {
  const { main, target } = fixture(t);
  assert.equal(reusableInstallation(main, dependencyFingerprint(main)), false);
  prepareDependencies(main, main);
  const marker = join(main, "node_modules", ".worktree-install.json");
  const original = readFileSync(marker);
  writeFileSync(marker, "invalid json");
  assert.equal(reusableInstallation(main, dependencyFingerprint(main)), false);
  writeFileSync(marker, original);
  assert.equal(reusableInstallation(main, "foreign-runtime"), false);
  symlinkSync(join(main, "node_modules"), join(target, "node_modules"));
  assert.equal(
    reusableInstallation(target, dependencyFingerprint(target)),
    false,
  );
});

test("bootstrap permits tooling work while check and dev block a remote database", (t) => {
  const { main } = fixture(t);
  const scripts = join(main, "scripts");
  mkdirSync(scripts);
  for (const name of ["worktree.mjs", "worktree-dependencies.mjs"]) {
    copyFileSync(
      fileURLToPath(new URL(`../../scripts/${name}`, import.meta.url)),
      join(scripts, name),
    );
  }
  assert.equal(spawnSync("git", ["init", "--quiet"], { cwd: main }).status, 0);
  writeFileSync(join(main, ".gitignore"), ".env.*\n");
  writeFileSync(join(main, ".env.prod"), "");
  writeFileSync(
    join(main, ".env.local"),
    [
      "CLERK_SECRET_KEY=sk_test_fixture",
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_fixture",
      "POSTGRES_PRISMA_URL=postgres://fixture:fixture@remote.invalid/shared",
      "POSTGRES_URL_NON_POOLING=postgres://fixture:fixture@remote.invalid/shared",
    ].join("\n"),
  );
  prepareDependencies(main, main);
  for (const name of [
    "puppeteer/lib/puppeteer/node/cli.js",
    "prisma/build/index.js",
    "@playwright/test/cli.js",
  ]) {
    const path = join(main, "node_modules", name);
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, "");
  }
  const run = (mode) =>
    spawnSync(process.execPath, ["scripts/worktree.mjs", mode], {
      cwd: main,
      encoding: "utf8",
      env: { PATH: process.env.PATH, HOME: process.env.HOME },
    });
  const setup = run("setup");
  assert.equal(setup.status, 0, setup.stderr);
  assert.match(
    setup.stderr,
    /Development startup blocked: Configure POSTGRES_PRISMA_URL/,
  );
  for (const mode of ["check", "dev"]) {
    const result = run(mode);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /shared and remote databases are blocked/);
    assert.doesNotMatch(result.stdout, /Development and image exports/);
  }
});

test("repairs a missing package instead of reusing or copying an incomplete tree", (t) => {
  const { main, target } = fixture(t);
  prepareDependencies(main, main);
  const fingerprint = dependencyFingerprint(main);
  rmSync(join(main, "node_modules/fixture-package"), { recursive: true });
  assert.equal(reusableInstallation(main, fingerprint), false);
  prepareDependencies(target, main);
  assert.equal(reusableInstallation(target, fingerprint), true);
  assert.equal(reusableInstallation(main, fingerprint), false);
  prepareDependencies(main, main);
  assert.equal(reusableInstallation(main, fingerprint), true);
});
