import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import {
  accessSync,
  constants,
  existsSync,
  lstatSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { freePort } from "./worktree-port.mjs";

const user = "scalonet";
const directory = (root) => resolve(root, ".local/postgres");
const dataDirectory = (root) => resolve(directory(root), "data");
const stateFile = (root) => resolve(directory(root), "state.json");

function writeState(root, state, initial = false) {
  const pending = resolve(
    directory(root),
    `.state-${randomBytes(8).toString("hex")}.pending`,
  );
  try {
    writeFileSync(pending, JSON.stringify(state), { flag: "wx", mode: 0o600 });
    if (initial) linkSync(pending, stateFile(root));
    else renameSync(pending, stateFile(root));
  } finally {
    rmSync(pending, { force: true });
  }
}

export const databaseName = (root) =>
  `scalonet_${createHash("sha256").update(realpathSync(root)).digest("hex").slice(0, 12)}`;

export function postgresBinaries() {
  const config = spawnSync("pg_config", ["--bindir"], { encoding: "utf8" });
  const executable = spawnSync("which", ["psql"], { encoding: "utf8" });
  const candidates = [
    config.status === 0 && config.stdout.trim(),
    executable.status === 0 && dirname(realpathSync(executable.stdout.trim())),
    "/opt/homebrew/opt/postgresql@17/bin",
    "/usr/local/opt/postgresql@17/bin",
  ];
  for (const path of candidates.filter(Boolean)) {
    try {
      for (const name of ["initdb", "pg_ctl", "psql", "createdb"]) {
        accessSync(resolve(path, name), constants.X_OK);
      }
      return path;
    } catch {}
  }
  throw new Error(
    "PostgreSQL tools are required. Install PostgreSQL and expose its pg_config on PATH.",
  );
}

function stateFor(root) {
  const file = stateFile(root);
  const stat = lstatSync(file);
  if (
    !stat.isFile() ||
    stat.isSymbolicLink() ||
    stat.uid !== process.getuid?.() ||
    stat.mode & 0o077
  ) {
    throw new Error(
      "PostgreSQL state must be a private file owned by the current user.",
    );
  }
  let state;
  try {
    state = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    throw new Error(
      "Invalid PostgreSQL state; preserve .local/postgres and inspect its configuration.",
    );
  }
  if (
    state.root !== realpathSync(root) ||
    !Number.isInteger(state.port) ||
    state.port < 1 ||
    state.port > 65535 ||
    !/^[a-f0-9]{48}$/.test(state.password)
  ) {
    throw new Error("PostgreSQL state does not belong to this worktree.");
  }
  return state;
}

function command(state, name, args) {
  return spawnSync(resolve(state.bin, name), args, {
    encoding: "utf8",
    timeout: 20_000,
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      LC_ALL: "C",
      LANG: "C",
      PGPASSWORD: state.password,
      PGCONNECT_TIMEOUT: "3",
    },
  });
}

function query(state, sql, database = "postgres") {
  const result = command(state, "psql", [
    "-X",
    "-w",
    "-h",
    "127.0.0.1",
    "-p",
    String(state.port),
    "-U",
    user,
    "-d",
    database,
    "-Atq",
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    sql,
  ]);
  if (result.status !== 0)
    throw new Error(
      "Cannot verify the owned local PostgreSQL server. Check .local/postgres/server.log.",
    );
  return result.stdout.trim();
}

function running(root, state) {
  return (
    command(state, "pg_ctl", ["-D", dataDirectory(root), "status"]).status === 0
  );
}

function verifyServer(root, state) {
  if (
    realpathSync(query(state, "SHOW data_directory")) !==
    realpathSync(dataDirectory(root))
  ) {
    throw new Error("PostgreSQL server belongs to another data directory.");
  }
}

function databaseUrl(root, state) {
  return `postgresql://${user}:${state.password}@127.0.0.1:${state.port}/${databaseName(root)}`;
}

export async function prepareDatabase(root) {
  const folder = directory(root);
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  if (lstatSync(folder).isSymbolicLink())
    throw new Error("PostgreSQL directory must not be a symlink.");
  let state;
  if (existsSync(stateFile(root))) {
    state = stateFor(root);
  } else {
    if (existsSync(dataDirectory(root)))
      throw new Error(
        "Unrecognized PostgreSQL data preserved; inspect .local/postgres before retrying.",
      );
    state = {
      root: realpathSync(root),
      bin: postgresBinaries(),
      port: await freePort(),
      password: randomBytes(24).toString("hex"),
    };
    writeState(root, state, true);
  }
  if (!existsSync(dataDirectory(root))) {
    const pending = mkdtempSync(resolve(folder, ".initialize-"));
    const passwordFile = resolve(pending, "password");
    writeFileSync(passwordFile, state.password, { mode: 0o600 });
    try {
      const result = command(state, "initdb", [
        "-D",
        resolve(pending, "data"),
        "-U",
        user,
        "--auth=scram-sha-256",
        `--pwfile=${passwordFile}`,
        "--encoding=UTF8",
        "--locale=C",
      ]);
      if (result.status !== 0)
        throw new Error("Cannot initialize the worktree PostgreSQL cluster.");
      renameSync(resolve(pending, "data"), dataDirectory(root));
    } finally {
      rmSync(pending, { recursive: true, force: true });
    }
  }
  if (lstatSync(dataDirectory(root)).isSymbolicLink())
    throw new Error("PostgreSQL data directory must not be a symlink.");
  if (!running(root, state)) {
    state.port = await freePort();
    writeState(root, state);
    const result = command(state, "pg_ctl", [
      "-D",
      dataDirectory(root),
      "-l",
      resolve(folder, "server.log"),
      "-w",
      "-t",
      "15",
      "-o",
      `-h 127.0.0.1 -p ${state.port} -k ''`,
      "start",
    ]);
    if (result.status !== 0)
      throw new Error(
        "Cannot start worktree PostgreSQL. Check .local/postgres/server.log and rerun setup.",
      );
  }
  verifyServer(root, state);
  const name = databaseName(root);
  if (
    query(state, `SELECT 1 FROM pg_database WHERE datname = '${name}'`) !== "1"
  ) {
    const result = command(state, "createdb", [
      "-w",
      "-h",
      "127.0.0.1",
      "-p",
      String(state.port),
      "-U",
      user,
      name,
    ]);
    if (result.status !== 0)
      throw new Error("Cannot create the worktree database.");
  }
  return databaseUrl(root, state);
}

export function verifyDatabase(root, url) {
  const state = stateFor(root);
  if (url !== databaseUrl(root, state))
    throw new Error(
      "Database connection does not match this worktree's owned PostgreSQL cluster. Rerun setup.",
    );
  verifyServer(root, state);
  query(state, "SELECT 1", databaseName(root));
}

export function stopDatabase(root) {
  if (!existsSync(stateFile(root))) return;
  const state = stateFor(root);
  if (!running(root, state)) return;
  verifyServer(root, state);
  const result = command(state, "pg_ctl", [
    "-D",
    dataDirectory(root),
    "-w",
    "-t",
    "15",
    "-m",
    "fast",
    "stop",
  ]);
  if (result.status !== 0)
    throw new Error("Cannot stop the owned worktree PostgreSQL server.");
}
