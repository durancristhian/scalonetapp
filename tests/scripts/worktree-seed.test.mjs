import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedWorktree } from "../../scripts/seed-worktree.mjs";
import {
  prepareDatabase,
  postgresBinaries,
  stopDatabase,
} from "../../scripts/worktree-database.mjs";

test("seeds one complete match once and preserves user changes", async (t) => {
  try {
    postgresBinaries();
  } catch (error) {
    if (process.env.CI) throw error;
    t.skip("PostgreSQL tools unavailable");
    return;
  }
  const root = mkdtempSync(join(tmpdir(), "scalonet-seed-"));
  t.after(() => {
    stopDatabase(root);
    rmSync(root, { recursive: true, force: true });
  });
  const url = await prepareDatabase(root);
  const env = {
    NODE_ENV: "development",
    CLERK_SECRET_KEY: "sk_test_fixture",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_fixture",
    CLERK_AGENT_USER_ID: "user_fixture",
    POSTGRES_PRISMA_URL: url,
    POSTGRES_URL_NON_POOLING: url,
  };
  const migrate = spawnSync(
    process.execPath,
    [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"],
    { encoding: "utf8", env: { ...process.env, ...env } },
  );
  assert.equal(migrate.status, 0, "Cannot migrate the owned seed fixture");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });
  t.after(() => prisma.$disconnect());
  assert.equal(await seedWorktree(root, env), true);
  const matches = await prisma.match.findMany({ include: { players: true } });
  assert.equal(matches.length, 1);
  const match = matches[0];
  assert.equal(match.name, "Argentina Celeste vs. Argentina Blanca");
  assert.equal(match.userId, "user_fixture");
  assert.equal(match.players.length, 20);
  const teams = JSON.parse(match.teams);
  assert.equal(teams.length, 2);
  assert.equal(new Set(teams.flatMap((team) => team.players)).size, 20);
  for (const team of teams) {
    assert.equal(team.players.length, 10);
    assert.deepEqual(Object.keys(team).sort(), ["id", "name", "players"]);
    assert.deepEqual(
      new Set(
        match.players
          .filter((player) => team.players.includes(player.id))
          .map((player) => player.position),
      ),
      new Set(["goa", "def", "mid", "for"]),
    );
  }
  await prisma.match.update({
    where: { id: match.id },
    data: { name: "My edited match" },
  });
  assert.equal(await seedWorktree(root, env), false);
  const reloaded = await prisma.match.findUniqueOrThrow({
    where: { id: match.id },
    include: { players: true },
  });
  assert.equal(reloaded.name, "My edited match");
  assert.equal(reloaded.teams, match.teams);
  assert.equal(await prisma.match.count(), 1);
  assert.equal(await prisma.player.count(), 20);
  await assert.rejects(
    seedWorktree(root, { ...env, NODE_ENV: "production" }),
    /Development/,
  );
  await assert.rejects(
    seedWorktree(root, {
      ...env,
      POSTGRES_PRISMA_URL: "postgresql://remote.invalid/shared",
    }),
    /does not match/,
  );
});
