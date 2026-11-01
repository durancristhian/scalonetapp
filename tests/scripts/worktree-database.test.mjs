import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  chmodSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import {
  prepareDatabase,
  verifyDatabase,
  stopDatabase,
  postgresBinaries,
} from "../../scripts/worktree-database.mjs";

function fixture(t) {
  try {
    postgresBinaries();
  } catch (error) {
    if (process.env.CI) throw error;
    t.skip("PostgreSQL tools are unavailable");
    return;
  }
  const root = mkdtempSync(join(tmpdir(), "scalonet-pg-"));
  t.after(() => {
    stopDatabase(root);
    rmSync(root, { recursive: true, force: true });
  });
  return root;
}

function query(root, sql, database) {
  const state = JSON.parse(
    readFileSync(join(root, ".local/postgres/state.json"), "utf8"),
  );
  const result = spawnSync(
    join(state.bin, "psql"),
    [
      "-X",
      "-w",
      "-h",
      "127.0.0.1",
      "-p",
      String(state.port),
      "-U",
      "scalonet",
      "-d",
      database,
      "-Atq",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      sql,
    ],
    {
      encoding: "utf8",
      env: { PATH: process.env.PATH, PGPASSWORD: state.password },
    },
  );
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test("owned PostgreSQL preserves data across setup, stop, restart and occupied ports", async (t) => {
  const root = fixture(t);
  if (!root) return;
  let url = await prepareDatabase(root);
  verifyDatabase(root, url);
  const name = new URL(url).pathname.slice(1);
  query(
    root,
    "CREATE TABLE setup_probe (value integer); INSERT INTO setup_probe VALUES (7)",
    name,
  );
  await prepareDatabase(root);
  assert.equal(query(root, "SELECT value FROM setup_probe", name), "7");
  const port = Number(new URL(url).port);
  stopDatabase(root);
  const foreign = createServer();
  await new Promise((resolve, reject) => {
    foreign.once("error", reject);
    foreign.listen(port, "127.0.0.1", resolve);
  });
  try {
    url = await prepareDatabase(root);
    assert.notEqual(Number(new URL(url).port), port);
    verifyDatabase(root, url);
    assert.equal(query(root, "SELECT value FROM setup_probe", name), "7");
    assert.equal(foreign.listening, true);
  } finally {
    await new Promise((resolve, reject) =>
      foreign.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("two worktrees have independent servers and stopping one leaves the other functional", async (t) => {
  const a = fixture(t);
  if (!a) return;
  const b = fixture(t);
  const [urlA, urlB] = await Promise.all([
    prepareDatabase(a),
    prepareDatabase(b),
  ]);
  assert.notEqual(new URL(urlA).port, new URL(urlB).port);
  assert.notEqual(new URL(urlA).pathname, new URL(urlB).pathname);
  assert.throws(() => verifyDatabase(a, urlB), /does not match/);
  stopDatabase(a);
  verifyDatabase(b, urlB);
  assert.equal(query(b, "SELECT 1", new URL(urlB).pathname.slice(1)), "1");
});

test("unrecognized data and nonprivate state are preserved and rejected", async (t) => {
  const root = fixture(t);
  if (!root) return;
  mkdirSync(join(root, ".local/postgres/data"), { recursive: true });
  const sentinel = join(root, ".local/postgres/data", "preserve");
  writeFileSync(sentinel, "unrecognized data");
  await assert.rejects(
    prepareDatabase(root),
    /Unrecognized PostgreSQL data preserved/,
  );
  assert.equal(readFileSync(sentinel, "utf8"), "unrecognized data");
  rmSync(join(root, ".local/postgres/data"), { recursive: true });
  const url = await prepareDatabase(root);
  const file = join(root, ".local/postgres/state.json");
  chmodSync(file, 0o644);
  try {
    assert.throws(() => verifyDatabase(root, url), /private file/);
  } finally {
    chmodSync(file, 0o600);
  }
});

test("interrupted metadata writes preserve the password and allow a retry", async (t) => {
  const root = fixture(t);
  if (!root) return;
  await prepareDatabase(root);
  stopDatabase(root);
  const file = join(root, ".local/postgres/state.json");
  const saved = readFileSync(file);
  const moduleUrl = new URL(
    "../../scripts/worktree-database.mjs",
    import.meta.url,
  ).href;
  const code = `
    import fs from 'node:fs';
    import {dirname} from 'node:path';
    import {syncBuiltinESMExports} from 'node:module';
    const write = fs.writeFileSync;
    fs.writeFileSync = (path, ...args) => {
      if (dirname(String(path)) === process.argv[2]) {
        fs.closeSync(fs.openSync(path, 'w'));
        process.exit(77);
      }
      return write(path, ...args);
    };
    syncBuiltinESMExports();
    const {prepareDatabase} = await import(${JSON.stringify(moduleUrl)});
    await prepareDatabase(process.argv[1]);
  `;
  const child = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", code, root, join(root, ".local/postgres")],
    { encoding: "utf8" },
  );
  try {
    assert.equal(child.status, 77, child.stderr);
    assert.ok(readFileSync(file).equals(saved));
  } finally {
    writeFileSync(file, saved, { mode: 0o600 });
  }
  const url = await prepareDatabase(root);
  verifyDatabase(root, url);
});
