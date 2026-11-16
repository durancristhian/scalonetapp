import { spawnSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  dependencyFingerprint,
  prepareDependencies,
  pruneDependencyCache,
  reusableInstallation,
} from "./worktree-dependencies.mjs";
import {
  exportBrowserEnvironment,
  prepareBrowsers,
} from "./worktree-browsers.mjs";
import {
  databaseContents,
  databaseName,
  prepareDatabase,
  verifyDatabase,
  stopDatabase,
} from "./worktree-database.mjs";
import { freePort } from "./worktree-port.mjs";
import {
  constants,
  copyFileSync,
  chmodSync,
  lstatSync,
  readFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { parseEnv } from "node:util";

const root = process.cwd();
process.umask(0o077);
const mode = process.argv[2];
function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}
function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { cwd: root, env, stdio: "inherit" });
  requireCondition(result.status === 0, `${command} failed.`);
}
function git(...args) {
  const result = spawnSync("git", args, { encoding: "utf8", cwd: root });
  requireCondition(
    result.status === 0,
    "Cannot inspect Git worktree configuration.",
  );
  return result.stdout.trim();
}
function privateFile(path) {
  const stat = lstatSync(path);
  requireCondition(
    stat.isFile() && !stat.isSymbolicLink(),
    "Environment files must be regular files, not symlinks.",
  );
  requireCondition(
    stat.uid === process.getuid?.(),
    "Environment files must belong to the current user.",
  );
  chmodSync(path, 0o600);
}
function copyEnvironment() {
  const main = resolve(git("rev-parse", "--git-common-dir"), "..");
  for (const name of [".env.local", ".env.prod"]) {
    requireCondition(
      git("check-ignore", name) === name,
      `${name} must be Git-ignored.`,
    );
    const destination = resolve(root, name);
    if (!existsSync(destination)) {
      const source = resolve(main, name);
      requireCondition(existsSync(source), `Main checkout is missing ${name}.`);
      privateFile(source);
      try {
        copyFileSync(source, destination, constants.COPYFILE_EXCL);
      } catch (error) {
        if (error.code !== "EEXIST") throw new Error(`Cannot copy ${name}.`);
      }
    }
    privateFile(destination);
  }
}
const setupRecord = resolve(root, ".local/worktree-setup.json");
const rerun = "Rerun bash scripts/setup-worktree.sh.";
const sha256 = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
const short = (revision) => revision?.slice(0, 7) ?? "no commit";
function revision(ref) {
  const result = spawnSync(
    "git",
    ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`],
    { encoding: "utf8", cwd: root },
  );
  return result.status === 0 ? result.stdout.trim() : null;
}
function launchedByT3() {
  const path = process.env.T3CODE_WORKTREE_PATH;
  try {
    return Boolean(path) && realpathSync(path) === realpathSync(root);
  } catch {
    return false;
  }
}
function localMigrations() {
  const folder = resolve(root, "prisma/migrations");
  if (!existsSync(folder)) return [];
  return readdirSync(folder, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(resolve(folder, entry.name, "migration.sql")),
    )
    .map((entry) => ({
      name: entry.name,
      checksum: sha256(resolve(folder, entry.name, "migration.sql")),
    }));
}
function verifyMigrations(applied) {
  const local = localMigrations();
  const names = (migrations) => migrations.map(({ name }) => name).join(", ");
  const failed = applied.filter(({ finished }) => !finished);
  requireCondition(
    failed.length === 0,
    `Failed migrations are recorded: ${names(failed)}. Inspect the owned database before rerunning setup.`,
  );
  const recorded = new Map(
    applied.map(({ name, checksum }) => [name, checksum]),
  );
  const known = new Set(local.map(({ name }) => name));
  const pending = local.filter(({ name }) => !recorded.has(name));
  requireCondition(
    pending.length === 0,
    `Pending migrations: ${names(pending)}. ${rerun}`,
  );
  const unknown = applied.filter(({ name }) => !known.has(name));
  requireCondition(
    unknown.length === 0,
    `The database has migrations missing from this revision: ${names(unknown)}.`,
  );
  const changed = local.filter(
    ({ name, checksum }) => recorded.get(name) !== checksum,
  );
  requireCondition(
    changed.length === 0,
    `Applied migrations differ from this revision: ${names(changed)}.`,
  );
  return local.length;
}
function verifyContents() {
  const { migrations, matches } = databaseContents(root);
  const count = verifyMigrations(migrations);
  requireCondition(
    matches > 0,
    `The worktree database has no matches. ${rerun}`,
  );
  return { migrations: count, matches };
}
function writeSetupRecord(record) {
  const pending = `${setupRecord}.pending`;
  writeFileSync(pending, `${JSON.stringify(record, null, 2)}\n`, {
    mode: 0o600,
  });
  renameSync(pending, setupRecord);
}
function readSetupRecord() {
  try {
    return JSON.parse(readFileSync(setupRecord, "utf8"));
  } catch {
    return null;
  }
}
function baseSummary({ head, originMain }) {
  if (!originMain)
    return `Setup ran at ${short(head)}; origin/main was unavailable.`;
  if (head === originMain)
    return `Setup ran at ${short(head)}, the fetched origin/main.`;
  const behind = spawnSync(
    "git",
    ["rev-list", "--count", `${head}..${originMain}`],
    { encoding: "utf8", cwd: root },
  );
  const count = behind.status === 0 ? Number(behind.stdout.trim()) : NaN;
  if (count === 0)
    return `Setup ran at ${short(head)}, which includes the fetched origin/main ${short(originMain)}.`;
  return `Setup ran at ${short(head)}, ${Number.isNaN(count) ? "an unknown number of" : count} commits behind the fetched origin/main ${short(originMain)}.`;
}
const expectedDatabase = databaseName(root);
const publicDefaults = [
  "NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL",
  "NEXT_PUBLIC_MAX_MATCHES_PER_USER",
  "NEXT_PUBLIC_IMAGE_UPLOAD_SIZE_LIMIT",
];
const template = existsSync(resolve(root, ".env.template"))
  ? parseEnv(readFileSync(resolve(root, ".env.template"), "utf8"))
  : {};
function developmentEnvironment(overrides = {}) {
  const file = resolve(root, ".env.local");
  requireCondition(existsSync(file), "Run npm run setup:worktree first.");
  privateFile(file);
  const local = parseEnv(readFileSync(file, "utf8"));
  requireCondition(
    ![process.env.NODE_ENV, local.NODE_ENV].includes("production"),
    "Remove NODE_ENV=production before local startup.",
  );
  const environment = {
    ...process.env,
    ...local,
    ...overrides,
    NODE_ENV: "development",
    DEVELOPMENT_PHOTO_NAMESPACE: expectedDatabase,
  };
  for (const key of publicDefaults) environment[key] ||= template[key];
  requireCondition(
    Number.isInteger(Number(environment.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL)) &&
      Number(environment.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL) >= 1 &&
      Number(environment.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL) <= 10,
    "Configure a default player level between 1 and 10.",
  );
  requireCondition(
    !environment.VERCEL_ENV || environment.VERCEL_ENV === "development",
    "Remove non-Development Vercel configuration before local startup.",
  );
  requireCondition(
    environment.CLERK_SECRET_KEY?.startsWith("sk_test_") &&
      environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_"),
    "Clerk Development keys are required in .env.local.",
  );
  for (const key of ["POSTGRES_PRISMA_URL", "POSTGRES_URL_NON_POOLING"]) {
    let url;
    try {
      url = new URL(environment[key]);
    } catch {
      throw new Error(
        `Configure ${key} with a local database named ${expectedDatabase}.`,
      );
    }
    requireCondition(
      ["postgres:", "postgresql:"].includes(url.protocol) &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
        decodeURIComponent(url.pathname) === `/${expectedDatabase}` &&
        !url.searchParams.has("host"),
      `Configure ${key} with a local database named ${expectedDatabase}; shared and remote databases are blocked.`,
    );
  }
  if (
    environment.BLOB_READ_WRITE_TOKEN ||
    environment.BLOB_STORE_ID ||
    environment.PLAYER_PHOTO_ORIGIN
  ) {
    requireCondition(
      environment.BLOB_READ_WRITE_TOKEN &&
        environment.PLAYER_PHOTO_ORIGIN &&
        environment.PLAYER_PHOTO_ORIGIN ===
          environment.DEVELOPMENT_PHOTO_ORIGIN,
      "Configure the approved Development/Preview Blob token and photo origin together.",
    );
    let origin;
    try {
      origin = new URL(environment.PLAYER_PHOTO_ORIGIN);
    } catch {
      throw new Error("Configure a valid Development photo origin.");
    }
    requireCondition(
      origin.protocol === "https:" &&
        origin.origin === environment.PLAYER_PHOTO_ORIGIN &&
        origin.hostname.endsWith(".public.blob.vercel-storage.com"),
      "Development photos require the approved public Blob origin.",
    );
    const productionFile = resolve(root, ".env.prod");
    if (existsSync(productionFile)) {
      const production = parseEnv(readFileSync(productionFile, "utf8"));
      requireCondition(
        production.PLAYER_PHOTO_ORIGIN !== environment.PLAYER_PHOTO_ORIGIN &&
          production.BLOB_READ_WRITE_TOKEN !==
            environment.BLOB_READ_WRITE_TOKEN,
        "Production Blob storage is blocked in Development.",
      );
    }
  }
  requireCondition(
    Boolean(environment.TELEGRAM_BOTID) ===
      Boolean(environment.TELEGRAM_CHATID),
    "Configure TELEGRAM_BOTID and TELEGRAM_CHATID together.",
  );
  for (const name of [".env", ".env.development", ".env.development.local"]) {
    requireCondition(
      !existsSync(resolve(root, name)),
      `Remove ${name}; local startup uses only .env.local.`,
    );
  }
  return environment;
}
async function prepareDevelopment() {
  const placeholder = `postgresql://127.0.0.1/${expectedDatabase}`;
  const settings = developmentEnvironment({
    POSTGRES_PRISMA_URL: placeholder,
    POSTGRES_URL_NON_POOLING: placeholder,
  });
  const url = await prepareDatabase(root);
  const file = resolve(root, ".env.local");
  const contents = readFileSync(file, "utf8");
  const local = parseEnv(contents);
  const generated = {
    POSTGRES_PRISMA_URL: url,
    POSTGRES_URL_NON_POOLING: url,
    DEVELOPMENT_PHOTO_NAMESPACE: expectedDatabase,
    ...Object.fromEntries(publicDefaults.map((key) => [key, settings[key]])),
  };
  if (Object.entries(generated).some(([key, value]) => local[key] !== value)) {
    const retained = contents
      .split("\n")
      .filter(
        (line) =>
          !Object.keys(generated).some((key) =>
            new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`).test(line),
          ),
      )
      .join("\n")
      .trimEnd();
    const pending = resolve(root, ".local/development-env.pending");
    writeFileSync(
      pending,
      `${retained}\n${Object.entries(generated)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join("\n")}\n`,
      { mode: 0o600 },
    );
    renameSync(pending, file);
  }
  const env = developmentEnvironment();
  verifyDatabase(root, env.POSTGRES_PRISMA_URL);
  run(
    process.execPath,
    ["node_modules/prisma/build/index.js", "migrate", "deploy"],
    { ...env, PRISMA_HIDE_UPDATE_MESSAGE: "1" },
  );
  return env;
}
try {
  const requiredNode = readFileSync(".nvmrc", "utf8").trim();
  requireCondition(
    `${process.versions.node}.`.startsWith(`${requiredNode}.`),
    `Node.js ${requiredNode} is required (.nvmrc).`,
  );
  if (mode === "setup") {
    const started = Date.now();
    rmSync(setupRecord, { force: true });
    copyEnvironment();
    mkdirSync(".local", { recursive: true, mode: 0o700 });
    chmodSync(".local", 0o700);
    const dependencyCache = resolve(
      git("rev-parse", "--git-common-dir"),
      "worktree-dependencies-v1",
    );
    prepareDependencies(root, dependencyCache);
    pruneDependencyCache(dependencyCache, [
      root,
      ...git("worktree", "list", "--porcelain", "-z")
        .split("\0")
        .filter((line) => line.startsWith("worktree "))
        .map((line) => line.slice("worktree ".length)),
    ]);
    prepareBrowsers(root, () =>
      run(process.execPath, [
        "node_modules/@playwright/test/cli.js",
        "install",
        "chromium",
      ]),
    );
    run(
      process.execPath,
      ["node_modules/prisma/build/index.js", "generate", "--no-hints"],
      {
        PATH: process.env.PATH,
        HOME: process.env.HOME,
        PRISMA_HIDE_UPDATE_MESSAGE: "1",
      },
    );
    const env = await prepareDevelopment();
    run(process.execPath, ["scripts/seed-worktree.mjs"], env);
    const contents = verifyContents();
    writeSetupRecord({
      completedAt: new Date().toISOString(),
      seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
      launchedBy: launchedByT3() ? "T3" : "manual",
      head: revision("HEAD"),
      originMain: revision("refs/remotes/origin/main"),
      node: process.version,
      dependencies: dependencyFingerprint(root),
      schema: sha256(resolve(root, "prisma/schema.prisma")),
      ...contents,
    });
    console.log("Worktree ready. Run npm run dev or npm run test:frontend.");
  } else if (mode === "check") {
    const record = readSetupRecord();
    const incomplete = "Setup has not completed in this worktree.";
    let env;
    try {
      env = developmentEnvironment();
    } catch (error) {
      throw new Error(
        record ? error.message : `${incomplete} ${error.message} ${rerun}`,
      );
    }
    requireCondition(record, `${incomplete} ${rerun}`);
    requireCondition(
      reusableInstallation(root, dependencyFingerprint(root)),
      `Dependencies do not match package-lock.json and Node ${process.version}. ${rerun}`,
    );
    requireCondition(
      record.schema === sha256(resolve(root, "prisma/schema.prisma")),
      `prisma/schema.prisma changed since setup. ${rerun}`,
    );
    try {
      verifyDatabase(root, env.POSTGRES_PRISMA_URL);
      verifyDatabase(root, env.POSTGRES_URL_NON_POOLING);
    } catch (error) {
      throw new Error(
        `${error.message} ${rerun} It restarts the owned PostgreSQL and preserves its data.`,
      );
    }
    const { migrations, matches } = verifyContents();
    const head = revision("HEAD");
    console.log(
      [
        `Setup completed ${record.completedAt} by ${record.launchedBy === "T3" ? "T3 in the worktree terminal" : "a manual run"} in ${record.seconds}s.`,
        baseSummary(record),
        ...(head === record.head
          ? []
          : [`HEAD is now ${short(head)}; setup inputs still match.`]),
        `Node ${process.version}; dependencies match package-lock.json.`,
        `Owned PostgreSQL verified: all ${migrations} migrations applied, ${matches} ${matches === 1 ? "match" : "matches"}.`,
        "Development configuration and owned database verified.",
      ].join("\n"),
    );
  } else if (mode === "database-stop") {
    stopDatabase(root);
    console.log("Owned worktree PostgreSQL stopped; data preserved.");
  } else if (mode === "browser") {
    const port = await freePort();
    run(
      process.execPath,
      [
        "node_modules/@playwright/test/cli.js",
        "test",
        ...process.argv.slice(3),
      ],
      {
        ...process.env,
        TEST_BROWSER_PORT: String(port),
      },
    );
  } else if (mode === "dev") {
    const env = await prepareDevelopment();
    const port = await freePort("localhost");
    const origin = `http://localhost:${port}`;
    console.log(`Development and image exports: ${origin}`);
    const child = spawn(
      process.execPath,
      [
        "node_modules/next/dist/bin/next",
        "dev",
        "--turbopack",
        "--hostname",
        "localhost",
        "--port",
        String(port),
      ],
      {
        stdio: "inherit",
        env: {
          ...env,
          PORT: String(port),
          IMAGE_EXPORT_ORIGIN: origin,
          ...exportBrowserEnvironment(env),
        },
      },
    );
    for (const signal of ["SIGINT", "SIGTERM"])
      process.on(signal, () => child.kill(signal));
    child.on("exit", (code) => process.exit(code ?? 1));
  } else {
    throw new Error("Use setup, check, database-stop, browser or dev.");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
