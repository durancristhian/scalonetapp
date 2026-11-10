import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer, connect } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
import {
  prepareDatabase,
  stopDatabase,
} from "../../scripts/worktree-database.mjs";

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: "user_startup_fixture" }),
}));

let root;
let connectionString;
let match;

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "scalonet-transaction-"));
  connectionString = await prepareDatabase(root);
  const migrate = spawnSync(
    process.execPath,
    [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"],
    {
      encoding: "utf8",
      env: { ...process.env, POSTGRES_URL_NON_POOLING: connectionString },
    },
  );
  expect(migrate.status, "Cannot migrate the owned database fixture").toBe(0);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    await prisma.match.createMany({
      data: [
        {
          name: "Older match",
          userId: "user_startup_fixture",
          updatedAt: new Date(0),
        },
        { name: "Other owner", userId: "user_other_fixture" },
      ],
    });
    match = await prisma.match.create({
      data: {
        name: "Current match",
        userId: "user_startup_fixture",
        players: { create: { name: "Synthetic player" } },
      },
      include: { players: true },
    });
  } finally {
    await prisma.$disconnect();
  }
});

afterAll(() => {
  if (root) {
    stopDatabase(root);
    rmSync(root, { recursive: true, force: true });
  }
});

async function withDelayedConnection(run) {
  const upstream = new URL(connectionString);
  const sockets = new Set();
  const timers = new Set();
  const proxy = createServer((downstream) => {
    sockets.add(downstream);
    downstream.on("error", () => {});
    downstream.pause();
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (downstream.destroyed) return;
      const socket = connect(Number(upstream.port), upstream.hostname);
      sockets.add(socket);
      socket.on("error", () => downstream.destroy());
      downstream.on("close", () => socket.destroy());
      socket.on("connect", () => {
        downstream.pipe(socket).pipe(downstream);
        downstream.resume();
      });
    }, 2500);
    timers.add(timer);
  });
  await new Promise((resolve) => proxy.listen(0, "127.0.0.1", resolve));
  const proxied = new URL(upstream);
  proxied.hostname = "127.0.0.1";
  proxied.port = String(proxy.address().port);
  vi.stubEnv("POSTGRES_PRISMA_URL", proxied.toString());
  const { default: prisma } = await import("../../utils/prisma.ts");
  try {
    await run(await import("../../server/queries/match.ts"));
  } finally {
    for (const timer of timers) clearTimeout(timer);
    for (const socket of sockets) socket.destroy();
    await prisma.$disconnect();
    await new Promise((resolve) => proxy.close(resolve));
    vi.unstubAllEnvs();
  }
}

test("dashboard lists owned matches when connection startup exceeds two seconds", async () => {
  await withDelayedConnection(async ({ getMatchesQuery }) => {
    await expect(getMatchesQuery({ take: 1 })).resolves.toEqual([
      [expect.objectContaining({ id: match.id, name: match.name })],
      2,
    ]);
  });
});

test("match details retain their player snapshot after a slow connection startup", async () => {
  await withDelayedConnection(async ({ getMatchByIdQuery }) => {
    await expect(getMatchByIdQuery(match.id)).resolves.toEqual(match);
    await expect(getMatchByIdQuery(-1)).resolves.toBeNull();
  });
});
