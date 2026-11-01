import { spawnSync, spawn } from "node:child_process";
import {
  constants,
  copyFileSync,
  chmodSync,
  lstatSync,
  readFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import { createServer } from "node:net";
import { createHash } from "node:crypto";

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
const databaseName = `scalonet_${createHash("sha256").update(root).digest("hex").slice(0, 12)}`;
function developmentEnvironment() {
  const file = resolve(root, ".env.local");
  requireCondition(existsSync(file), "Run npm run setup:worktree first.");
  privateFile(file);
  const local = parseEnv(readFileSync(file, "utf8"));
  requireCondition(
    ![process.env.NODE_ENV, local.NODE_ENV].includes("production"),
    "Remove NODE_ENV=production before local startup.",
  );
  const environment = { ...process.env, ...local, NODE_ENV: "development" };
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
        `Configure ${key} with a local database named ${databaseName}.`,
      );
    }
    requireCondition(
      ["postgres:", "postgresql:"].includes(url.protocol) &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
        decodeURIComponent(url.pathname) === `/${databaseName}` &&
        !url.searchParams.has("host"),
      `Configure ${key} with a local database named ${databaseName}; shared and remote databases are blocked.`,
    );
  }
  requireCondition(
    !environment.BLOB_READ_WRITE_TOKEN,
    "Remove BLOB_READ_WRITE_TOKEN for isolated local development.",
  );
  requireCondition(
    !environment.TELEGRAM_BOTID && !environment.TELEGRAM_CHATID,
    "Remove Telegram credentials for isolated local development.",
  );
  for (const name of [".env", ".env.development", ".env.development.local"]) {
    requireCondition(
      !existsSync(resolve(root, name)),
      `Remove ${name}; local startup uses only .env.local.`,
    );
  }
  return environment;
}
async function freePort(host = "127.0.0.1") {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, host, resolve);
  });
  const port = server.address().port;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}
try {
  requireCondition(
    process.versions.node.split(".")[0] === "26",
    "Node.js 26 is required.",
  );
  if (mode === "setup") {
    copyEnvironment();
    mkdirSync(".local", { recursive: true, mode: 0o700 });
    chmodSync(".local", 0o700);
    const install = spawnSync("npm", ["ci"], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 16 * 1024 * 1024,
      env: {
        ...process.env,
        PUPPETEER_CACHE_DIR: resolve(root, ".local/puppeteer"),
        PUPPETEER_SKIP_DOWNLOAD: "false",
      },
    });
    requireCondition(
      install.status === 0,
      "npm ci failed. Check registry access and package-lock.json; installer output withheld to protect configuration.",
    );
    run(process.execPath, ["node_modules/prisma/build/index.js", "generate"], {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
    });
    run(
      process.execPath,
      ["node_modules/@playwright/test/cli.js", "install", "chromium"],
      {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: resolve(root, ".local/browsers"),
      },
    );
    developmentEnvironment();
    console.log("Worktree ready. Run npm run dev or npm run test:frontend.");
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
        ...(existsSync(".local/browsers")
          ? { PLAYWRIGHT_BROWSERS_PATH: resolve(root, ".local/browsers") }
          : {}),
      },
    );
  } else if (mode === "dev") {
    const env = developmentEnvironment();
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
          PUPPETEER_CACHE_DIR: resolve(root, ".local/puppeteer"),
        },
      },
    );
    for (const signal of ["SIGINT", "SIGTERM"])
      process.on(signal, () => child.kill(signal));
    child.on("exit", (code) => process.exit(code ?? 1));
  } else {
    throw new Error("Use setup or dev.");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
