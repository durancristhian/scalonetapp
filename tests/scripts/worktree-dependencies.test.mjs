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
  existsSync,
  readdirSync,
  statSync,
  utimesSync,
} from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  postgresBinaries,
  stopDatabase,
} from "../../scripts/worktree-database.mjs";
import { parseEnv } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  prepareDependencies,
  pruneDependencyCache,
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
const path = require('node:path');
fs.appendFileSync(path.resolve(__dirname, '../npm-calls'), process.cwd() + '\\n');
if (process.env.NPM_FIXTURE_FAIL) process.exit(1);
if (process.env.NPM_FIXTURE_DELAY) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
fs.mkdirSync('node_modules/.bin', {recursive:true});
fs.writeFileSync('node_modules/proof', 'original');
fs.symlinkSync('../proof', 'node_modules/.bin/proof');
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
  return { main, target, cache: join(directory, "cache"), directory };
}

test("installs once, copies an independent tree, and reuses it", (t) => {
  const { main, target, cache } = fixture(t);
  prepareDependencies(main, cache);
  assert.equal(reusableInstallation(main, dependencyFingerprint(main)), true);
  prepareDependencies(target, cache);
  assert.equal(
    readFileSync(join(target, "node_modules", ".bin", "proof"), "utf8"),
    "original",
  );
  writeFileSync(join(target, "node_modules", "proof"), "changed");
  assert.equal(
    readFileSync(join(main, "node_modules", "proof"), "utf8"),
    "original",
  );
  prepareDependencies(target, cache);
  assert.equal(
    readFileSync(join(target, "node_modules", "proof"), "utf8"),
    "changed",
  );
});

test("rejects changed manifests, npm configuration and installed lock", (t) => {
  const { main, cache } = fixture(t);
  prepareDependencies(main, cache);
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
  const { main, target, cache } = fixture(t);
  assert.equal(reusableInstallation(main, dependencyFingerprint(main)), false);
  prepareDependencies(main, cache);
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

function bootstrapFixture(t) {
  let bin;
  try {
    bin = postgresBinaries();
  } catch (error) {
    if (process.env.CI) throw error;
    t.skip("PostgreSQL tools are unavailable");
    return;
  }
  const { main, cache } = fixture(t);
  t.after(() => stopDatabase(main));
  for (const name of [".env.template", ".nvmrc"]) {
    copyFileSync(
      fileURLToPath(new URL(`../../${name}`, import.meta.url)),
      join(main, name),
    );
  }
  const scripts = join(main, "scripts");
  mkdirSync(scripts);
  for (const name of [
    "worktree.mjs",
    "worktree-dependencies.mjs",
    "worktree-browsers.mjs",
    "worktree-database.mjs",
    "worktree-port.mjs",
  ]) {
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
      'NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL=""',
      "CLERK_SECRET_KEY=sk_test_fixture",
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_fixture",
      "POSTGRES_PRISMA_URL=postgres://fixture:fixture@remote.invalid/shared",
      "POSTGRES_URL_NON_POOLING=postgres://fixture:fixture@remote.invalid/shared",
    ].join("\n"),
  );
  prepareDependencies(main, cache);
  const psql = JSON.stringify(join(bin, "psql"));
  const stubs = {
    "prisma/build/index.js": `const { spawnSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
if (process.argv[2] !== "migrate") process.exit(0);
const folder = "prisma/migrations";
const rows = (fs.existsSync(folder) ? fs.readdirSync(folder) : []).map((name) => {
  const sql = fs.readFileSync(folder + "/" + name + "/migration.sql");
  return "('" + name + "', '" + createHash("sha256").update(sql).digest("hex") + "', now())";
});
const sql = "CREATE TABLE IF NOT EXISTS _prisma_migrations (migration_name text PRIMARY KEY, checksum text, finished_at timestamptz, rolled_back_at timestamptz);" +
  (rows.length ? "INSERT INTO _prisma_migrations VALUES " + rows.join(", ") + " ON CONFLICT DO NOTHING;" : "");
const result = spawnSync(${psql}, ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-c", sql, process.env.POSTGRES_URL_NON_POOLING], { stdio: "inherit" });
process.exit(result.status);
`,
    "@playwright/test/cli.js": "",
  };
  for (const [name, contents] of Object.entries(stubs)) {
    const path = join(main, "node_modules", name);
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, contents);
  }
  writeFileSync(
    join(scripts, "seed-worktree.mjs"),
    `import { spawnSync } from "node:child_process";
if (process.env.SEED_FIXTURE_FAIL) process.exit(1);
const sql = 'CREATE TABLE IF NOT EXISTS "Match" (id serial); INSERT INTO "Match" SELECT FROM (SELECT 1) AS one WHERE NOT EXISTS (SELECT FROM "Match");';
const result = spawnSync(${psql}, ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-c", sql, process.env.POSTGRES_PRISMA_URL], { stdio: "inherit" });
process.exit(result.status);
`,
  );
  mkdirSync(join(main, "prisma/migrations/20240101000000_init"), {
    recursive: true,
  });
  writeFileSync(join(main, "prisma/schema.prisma"), "// fixture\n");
  writeFileSync(
    join(main, "prisma/migrations/20240101000000_init/migration.sql"),
    "SELECT 1;\n",
  );
  const run = (mode, extra = {}) =>
    spawnSync(process.execPath, ["scripts/worktree.mjs", mode], {
      cwd: main,
      encoding: "utf8",
      env: { PATH: process.env.PATH, HOME: process.env.HOME, ...extra },
    });
  return { main, scripts, run };
}

test("bootstrap replaces remote connections with an owned database and rejects live Clerk keys", (t) => {
  const bootstrap = bootstrapFixture(t);
  if (!bootstrap) return;
  const { main, run } = bootstrap;
  const setup = run("setup");
  assert.equal(setup.status, 0, setup.stderr);
  assert.match(setup.stdout, /Worktree ready/);
  const prepared = readFileSync(join(main, ".env.local"), "utf8");
  const env = parseEnv(prepared);
  assert.equal(new URL(env.POSTGRES_PRISMA_URL).hostname, "127.0.0.1");
  assert.equal(env.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL, "5");
  assert.equal(env.NEXT_PUBLIC_MAX_MATCHES_PER_USER, "100");
  assert.equal(run("check").status, 0);
  assert.match(env.DEVELOPMENT_PHOTO_NAMESPACE, /^scalonet_[a-f0-9]{12}$/);
  const blob = `${prepared}\nBLOB_READ_WRITE_TOKEN=fixture-token\nPLAYER_PHOTO_ORIGIN=https://fixture.public.blob.vercel-storage.com\n`;
  writeFileSync(join(main, ".env.local"), blob);
  assert.match(run("check").stderr, /approved Development\/Preview Blob/);
  writeFileSync(
    join(main, ".env.local"),
    `${blob}DEVELOPMENT_PHOTO_ORIGIN=https://fixture.public.blob.vercel-storage.com\n`,
  );
  assert.equal(run("check").status, 0);
  writeFileSync(
    join(main, ".env.prod"),
    "PLAYER_PHOTO_ORIGIN=https://fixture.public.blob.vercel-storage.com\n",
  );
  assert.match(run("check").stderr, /Production Blob storage is blocked/);
  writeFileSync(join(main, ".env.prod"), "");
  writeFileSync(
    join(main, ".env.local"),
    `${prepared}\nTELEGRAM_BOTID=fixture-bot\nTELEGRAM_CHATID=fixture-chat\n`,
  );
  assert.equal(run("check").status, 0);
  writeFileSync(
    join(main, ".env.local"),
    `${prepared}\nTELEGRAM_BOTID=fixture-bot\n`,
  );
  const incompleteTelegram = run("check");
  assert.equal(incompleteTelegram.status, 1);
  assert.match(
    incompleteTelegram.stderr,
    /Configure TELEGRAM_BOTID and TELEGRAM_CHATID together/,
  );
  writeFileSync(
    join(main, ".env.local"),
    prepared
      .replaceAll("sk_test_", "sk_live_")
      .replaceAll("pk_test_", "pk_live_"),
  );
  for (const mode of ["setup", "check", "dev"]) {
    const result = run(mode);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Clerk Development keys are required/);
    assert.doesNotMatch(result.stdout, /Development and image exports/);
  }
});

test("setup records completion and check confirms dependencies, schema, migrations and seed", (t) => {
  const bootstrap = bootstrapFixture(t);
  if (!bootstrap) return;
  const { main, run } = bootstrap;
  const record = join(main, ".local/worktree-setup.json");
  const failed = (pattern) => {
    const result = run("check");
    assert.equal(result.status, 1, result.stdout);
    assert.match(result.stderr, pattern);
  };
  failed(/Setup has not completed/);
  const automatic = run("setup", { T3CODE_WORKTREE_PATH: main });
  assert.equal(automatic.status, 0, automatic.stderr);
  assert.equal(statSync(record).mode & 0o777, 0o600);
  assert.equal(JSON.parse(readFileSync(record, "utf8")).launchedBy, "T3");
  const check = run("check");
  assert.equal(check.status, 0, check.stderr);
  assert.match(check.stdout, /by T3 in the worktree terminal/);
  assert.match(check.stdout, /all 1 migrations applied, 1 match\./);
  assert.equal(run("setup", { T3CODE_WORKTREE_PATH: "" }).status, 0);
  assert.match(run("check").stdout, /by a manual run/);
  const migration = join(main, "prisma/migrations/20240201000000_next");
  mkdirSync(migration);
  writeFileSync(join(migration, "migration.sql"), "SELECT 2;\n");
  failed(/Pending migrations: 20240201000000_next\. Rerun/);
  assert.equal(run("setup").status, 0);
  assert.match(run("check").stdout, /all 2 migrations applied/);
  writeFileSync(join(migration, "migration.sql"), "SELECT 3;\n");
  failed(/Applied migrations differ from this revision: 20240201000000_next/);
  rmSync(migration, { recursive: true });
  failed(/migrations missing from this revision: 20240201000000_next/);
  mkdirSync(migration);
  writeFileSync(join(migration, "migration.sql"), "SELECT 2;\n");
  assert.equal(run("check").status, 0);
  writeFileSync(join(main, "prisma/schema.prisma"), "// changed\n");
  failed(/schema\.prisma changed since setup/);
  writeFileSync(join(main, "prisma/schema.prisma"), "// fixture\n");
  const state = JSON.parse(
    readFileSync(join(main, ".local/postgres/state.json"), "utf8"),
  );
  const env = parseEnv(readFileSync(join(main, ".env.local"), "utf8"));
  const emptied = spawnSync(
    join(state.bin, "psql"),
    ["-X", "-q", "-c", 'DELETE FROM "Match"', env.POSTGRES_PRISMA_URL],
    { encoding: "utf8" },
  );
  assert.equal(emptied.status, 0, emptied.stderr);
  failed(/no matches\. Rerun/);
  assert.equal(run("setup").status, 0);
  assert.equal(run("check").status, 0);
  stopDatabase(main);
  failed(/Cannot verify the owned local PostgreSQL server.*Rerun/);
  assert.equal(run("setup").status, 0);
  const lock = join(main, "package-lock.json");
  const locked = readFileSync(lock, "utf8");
  writeFileSync(lock, locked.replace('"1.0.0"', '"1.0.1"'));
  failed(/Dependencies do not match package-lock\.json/);
  writeFileSync(lock, locked);
  assert.equal(run("check").status, 0);
  const broken = run("setup", { SEED_FIXTURE_FAIL: "1" });
  assert.equal(broken.status, 1);
  assert.equal(existsSync(record), false);
  failed(/Setup has not completed/);
});

test("repairs a missing package instead of reusing or copying an incomplete tree", (t) => {
  const { main, target, cache } = fixture(t);
  prepareDependencies(main, cache);
  const fingerprint = dependencyFingerprint(main);
  rmSync(join(main, "node_modules/fixture-package"), { recursive: true });
  assert.equal(reusableInstallation(main, fingerprint), false);
  prepareDependencies(target, cache);
  assert.equal(reusableInstallation(target, fingerprint), true);
  assert.equal(reusableInstallation(main, fingerprint), false);
  prepareDependencies(main, cache);
  assert.equal(reusableInstallation(main, fingerprint), true);
});

test("cache survives its source checkout and ignores application-only changes", (t) => {
  const { main, target, cache, directory } = fixture(t);
  prepareDependencies(main, cache);
  const fingerprint = dependencyFingerprint(main);
  rmSync(main, { recursive: true });
  writeFileSync(join(target, "app.ts"), "changed application code");
  assert.equal(dependencyFingerprint(target), fingerprint);
  prepareDependencies(target, cache);
  assert.equal(reusableInstallation(target, fingerprint), true);
  assert.equal(
    readFileSync(join(directory, "npm-calls"), "utf8").trim().split("\n")
      .length,
    1,
  );
});

test("changed dependencies create a new cache without invalidating older branches", (t) => {
  const { main, target, cache, directory } = fixture(t);
  prepareDependencies(main, cache);
  const previous = dependencyFingerprint(main);
  writeFileSync(
    join(target, "package-lock.json"),
    '{"lockfileVersion":3,"packages":{},"changed":true}',
  );
  const current = dependencyFingerprint(target);
  prepareDependencies(target, cache);
  assert.notEqual(previous, current);
  assert.equal(readdirSync(cache).length, 2);
  assert.equal(
    readFileSync(join(directory, "npm-calls"), "utf8").trim().split("\n")
      .length,
    2,
  );
  assert.equal(reusableInstallation(main, previous), true);
});

test("pruning keeps cache entries of existing worktrees and removes the rest", (t) => {
  const { main, target, cache, directory } = fixture(t);
  prepareDependencies(main, cache);
  const current = dependencyFingerprint(main);
  writeFileSync(join(target, "package-lock.json"), '{"changed":1}');
  prepareDependencies(target, cache);
  const installed = dependencyFingerprint(target);
  writeFileSync(join(target, "package-lock.json"), '{"changed":2}');
  const unused = join(cache, "a".repeat(64));
  mkdirSync(join(unused, "ready-old", "node_modules"), { recursive: true });
  mkdirSync(join(unused, ".pending-active"));
  const abandoned = join(cache, "b".repeat(64), ".pending-abandoned");
  mkdirSync(abandoned, { recursive: true });
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  utimesSync(abandoned, twoDaysAgo, twoDaysAgo);
  writeFileSync(join(cache, "unrelated"), "");
  pruneDependencyCache(cache, [main, target, join(directory, "missing")]);
  assert.deepEqual(
    readdirSync(cache).sort(),
    [current, installed, "a".repeat(64), "unrelated"].sort(),
  );
  assert.deepEqual(readdirSync(unused), [".pending-active"]);
  rmSync(target, { recursive: true });
  pruneDependencyCache(cache, [main, target]);
  assert.deepEqual(
    readdirSync(cache).sort(),
    [current, "a".repeat(64), "unrelated"].sort(),
  );
  rmSync(join(main, "node_modules"), { recursive: true });
  prepareDependencies(main, cache);
  assert.equal(reusableInstallation(main, current), true);
  assert.equal(
    readFileSync(join(directory, "npm-calls"), "utf8").trim().split("\n")
      .length,
    2,
  );
});

test("corrupt and unpublished cache entries are skipped and rebuilt", (t) => {
  const { main, target, cache, directory } = fixture(t);
  prepareDependencies(main, cache);
  const fingerprint = dependencyFingerprint(main);
  const bucket = join(cache, fingerprint);
  const ready = readdirSync(bucket).find((name) => name.startsWith("ready-"));
  rmSync(join(bucket, ready, "node_modules/fixture-package"), {
    recursive: true,
  });
  mkdirSync(join(bucket, ".pending-interrupted", "node_modules"), {
    recursive: true,
  });
  rmSync(main, { recursive: true });
  prepareDependencies(target, cache);
  assert.equal(reusableInstallation(target, fingerprint), true);
  assert.equal(
    readFileSync(join(directory, "npm-calls"), "utf8").trim().split("\n")
      .length,
    2,
  );
  assert.equal(
    readdirSync(bucket)
      .filter((name) => name.startsWith("ready-"))
      .some((name) => reusableInstallation(join(bucket, name), fingerprint)),
    true,
  );
});

test("failed installation publishes no cache and the next attempt recovers", (t) => {
  const { main, cache } = fixture(t);
  process.env.NPM_FIXTURE_FAIL = "1";
  try {
    assert.throws(() => prepareDependencies(main, cache), /npm ci failed/);
  } finally {
    delete process.env.NPM_FIXTURE_FAIL;
  }
  assert.equal(existsSync(cache), false);
  prepareDependencies(main, cache);
  assert.equal(reusableInstallation(main, dependencyFingerprint(main)), true);
});

test("concurrent worktrees publish complete snapshots and keep their copies independent", async (t) => {
  const { main, target, cache, directory } = fixture(t);
  const moduleUrl = new URL(
    "../../scripts/worktree-dependencies.mjs",
    import.meta.url,
  ).href;
  const code = `import {prepareDependencies} from ${JSON.stringify(moduleUrl)}; prepareDependencies(process.argv[1], process.argv[2]);`;
  const run = (root) =>
    new Promise((resolve, reject) => {
      const child = spawn(
        process.execPath,
        ["--input-type=module", "-e", code, root, cache],
        { env: { ...process.env, NPM_FIXTURE_DELAY: "1" } },
      );
      let stderr = "";
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
      child.on("error", reject);
      child.on("close", (status) =>
        status === 0 ? resolve() : reject(new Error(stderr)),
      );
    });
  await Promise.all([run(main), run(target)]);
  const fingerprint = dependencyFingerprint(main);
  assert.equal(reusableInstallation(main, fingerprint), true);
  assert.equal(reusableInstallation(target, fingerprint), true);
  const bucket = join(cache, fingerprint);
  for (const name of readdirSync(bucket)) {
    assert.match(name, /^ready-/);
    assert.equal(reusableInstallation(join(bucket, name), fingerprint), true);
  }
  writeFileSync(join(main, "node_modules/proof"), "only main");
  assert.equal(
    readFileSync(join(target, "node_modules/proof"), "utf8"),
    "original",
  );
  rmSync(join(target, "node_modules"), { recursive: true });
  process.env.NPM_FIXTURE_FAIL = "1";
  try {
    prepareDependencies(target, cache);
  } finally {
    delete process.env.NPM_FIXTURE_FAIL;
  }
  assert.equal(
    readFileSync(join(target, "node_modules/proof"), "utf8"),
    "original",
  );
  assert.ok(existsSync(join(directory, "npm-calls")));
});
