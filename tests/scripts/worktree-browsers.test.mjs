import assert from "node:assert/strict";
import { test } from "node:test";
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
  chmodSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prepareBrowsers } from "../../scripts/worktree-browsers.mjs";

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "scalonet-browsers-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const roots = ["first", "second", "third"].map((name) =>
    join(directory, name),
  );
  for (const root of roots) {
    mkdirSync(root);
    writeFileSync(join(root, "package.json"), '{"name":"fixture"}');
    writeFileSync(join(root, "package-lock.json"), "{}");
  }
  let downloads = 0;
  const install = (root) => () => {
    for (const name of ["browsers", "puppeteer"]) {
      const path = join(root, ".local", name, "executable");
      if (!existsSync(path)) {
        downloads++;
        mkdirSync(join(path, ".."), { recursive: true });
        writeFileSync(path, "binary");
        chmodSync(path, 0o700);
      }
    }
    mkdirSync(join(root, ".local/browsers/.links"), { recursive: true });
    writeFileSync(join(root, ".local/browsers/.links/local"), root);
  };
  return {
    roots,
    cache: join(directory, "cache"),
    install,
    downloads: () => downloads,
  };
}

test("new worktrees reuse browser downloads and retain independent executable files", (t) => {
  const {
    roots: [first, second, third],
    cache,
    install,
    downloads,
  } = fixture(t);
  prepareBrowsers(first, cache, install(first));
  assert.equal(downloads(), 2);
  rmSync(first, { recursive: true });
  prepareBrowsers(second, cache, install(second));
  assert.equal(downloads(), 2);
  assert.ok(statSync(join(second, ".local/browsers/executable")).mode & 0o100);
  assert.equal(
    readFileSync(join(second, ".local/browsers/.links/local"), "utf8"),
    second,
  );
  writeFileSync(join(second, ".local/browsers/executable"), "changed");
  prepareBrowsers(second, cache, install(second));
  assert.equal(
    readFileSync(join(second, ".local/browsers/executable"), "utf8"),
    "changed",
  );
  prepareBrowsers(third, cache, install(third));
  assert.equal(
    readFileSync(join(third, ".local/browsers/executable"), "utf8"),
    "binary",
  );
  assert.equal(downloads(), 2);
});

test("restoring a missing browser directory preserves the other local directory", (t) => {
  const {
    roots: [first, second],
    cache,
    install,
    downloads,
  } = fixture(t);
  prepareBrowsers(first, cache, install(first));
  const path = join(second, ".local/browsers/executable");
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, "local");
  prepareBrowsers(second, cache, install(second));
  assert.equal(downloads(), 2);
  assert.equal(readFileSync(path, "utf8"), "local");
});

test("changed manifests retain older browser snapshots", (t) => {
  const {
    roots: [first, second, third],
    cache,
    install,
    downloads,
  } = fixture(t);
  prepareBrowsers(first, cache, install(first));
  writeFileSync(join(second, "package-lock.json"), '{"changed":true}');
  prepareBrowsers(second, cache, install(second));
  assert.equal(downloads(), 4);
  assert.equal(readdirSync(cache).length, 2);
  prepareBrowsers(third, cache, install(third));
  assert.equal(downloads(), 4);
});

test("failed installs publish no snapshot and installers repair incomplete local browsers", (t) => {
  const {
    roots: [first, second],
    cache,
    install,
    downloads,
  } = fixture(t);
  assert.throws(
    () =>
      prepareBrowsers(first, cache, () => {
        install(first)();
        throw new Error("interrupted");
      }),
    /interrupted/,
  );
  assert.equal(existsSync(cache), false);
  prepareBrowsers(first, cache, install(first));
  prepareBrowsers(second, cache, install(second));
  rmSync(join(second, ".local/browsers/executable"));
  prepareBrowsers(second, cache, install(second));
  assert.equal(downloads(), 3);
});

test("concurrent worktrees publish complete snapshots without sharing mutable files", async (t) => {
  const {
    roots: [first, second, third],
    cache,
    install,
    downloads,
  } = fixture(t);
  const moduleUrl = new URL(
    "../../scripts/worktree-browsers.mjs",
    import.meta.url,
  ).href;
  const code = `
    import {prepareBrowsers} from ${JSON.stringify(moduleUrl)};
    import {mkdirSync,writeFileSync} from 'node:fs';
    import {join} from 'node:path';
    const [root,cache]=process.argv.slice(1);
    prepareBrowsers(root,cache,()=>{
      for(const name of ['browsers','puppeteer']){
        mkdirSync(join(root,'.local',name),{recursive:true});
        writeFileSync(join(root,'.local',name,'executable'),'binary');
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,100);
    });`;
  await Promise.all(
    [first, second].map(
      (root) =>
        new Promise((resolve, reject) => {
          const child = spawn(process.execPath, [
            "--input-type=module",
            "-e",
            code,
            root,
            cache,
          ]);
          let stderr = "";
          child.stderr.on("data", (chunk) => {
            stderr += chunk;
          });
          child.on("error", reject);
          child.on("close", (status) =>
            status === 0 ? resolve() : reject(new Error(stderr)),
          );
        }),
    ),
  );
  for (const bucket of readdirSync(cache)) {
    for (const name of readdirSync(join(cache, bucket))) {
      assert.match(name, /^ready-/);
      assert.equal(
        existsSync(join(cache, bucket, name, "browsers/.links")),
        false,
      );
      for (const browser of ["browsers", "puppeteer"]) {
        assert.equal(
          readFileSync(
            join(cache, bucket, name, browser, "executable"),
            "utf8",
          ),
          "binary",
        );
      }
    }
  }
  writeFileSync(join(first, ".local/browsers/executable"), "changed");
  prepareBrowsers(third, cache, install(third));
  assert.equal(downloads(), 0);
  assert.equal(
    readFileSync(join(third, ".local/browsers/executable"), "utf8"),
    "binary",
  );
});
