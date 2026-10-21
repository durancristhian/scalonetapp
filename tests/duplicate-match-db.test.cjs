const assert = require("node:assert/strict");
const { test } = require("node:test");
const { randomUUID } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");
const sourceLoader = require("./load-source.cjs");

// This optional integration suite refuses remote or general-purpose databases.
const connection = process.env.DUPLICATION_TEST_DATABASE_URL;
if (!connection) throw new Error("Set DUPLICATION_TEST_DATABASE_URL to a dedicated local scalonet_duplication_test database");
const url = new URL(connection);
assert.ok(["127.0.0.1", "localhost"].includes(url.hostname));
assert.equal(url.pathname, "/scalonet_duplication_test");
const prisma = new PrismaClient({ datasourceUrl: connection });

function actionFor(owner, db = prisma) {
  return sourceLoader({
    "@/utils/prisma": db,
    "@/server/player-photos": {},
    "@clerk/nextjs/server": { auth: async () => ({ userId: owner }) },
    "next/cache": { revalidatePath() {} },
    console: { error() {} },
  })("server/actions/match.ts").duplicateMatchAction;
}

test("PostgreSQL: recovered legacy roster, valid teams, ownership and rollback", async t => {
  const owner = `duplication-test-${randomUUID()}`;
  try {
    await t.test("the incident's 33-player / 7-missing-reference pattern duplicates without modifying its source", async () => {
      const source = await prisma.match.create({ data: { name: "Legacy fixture", userId: owner,
        players: { create: Array.from({ length: 33 }, (_, i) => ({ name: `Fixture ${i}` })) } }, include: { players: true } });
      const assignments = [...source.players.slice(0, 15).map(p => p.id), ...Array.from({ length: 7 }, (_, i) => 2147483600 + i)];
      const teams = JSON.stringify([{ id: "a", name: "A", players: assignments.slice(0, 11) }, { id: "b", name: "B", players: assignments.slice(11) }]);
      await prisma.match.update({ where: { id: source.id }, data: { teams } });
      assert.deepEqual(await actionFor(owner)(source.id), { ok: true, teamsReset: true });
      const copy = await prisma.match.findFirst({ where: { userId: owner, id: { not: source.id } }, include: { players: true } });
      assert.equal(copy.players.length, 33); assert.equal(copy.teams, "[]");
      assert.equal((await prisma.match.findUnique({ where: { id: source.id } })).teams, teams);
      assert.deepEqual(await actionFor("other-owner")(source.id), { ok: false, code: "not_found" });
    });

    await t.test("valid teams use only new IDs and repeated copies have distinct names", async () => {
      const source = await prisma.match.create({ data: { name: "Valid fixture", userId: owner,
        players: { create: [{ name: "A" }, { name: "B", level: 8 }] } }, include: { players: true } });
      const teams = source.players.map((p, i) => ({ id: `team-${i}`, name: `Team ${i}`, players: [p.id] }));
      await prisma.match.update({ where: { id: source.id }, data: { teams: JSON.stringify(teams) } });
      assert.deepEqual(await actionFor(owner)(source.id), { ok: true, teamsReset: false });
      assert.deepEqual(await actionFor(owner)(source.id), { ok: true, teamsReset: false });
      const copies = await prisma.match.findMany({ where: { userId: owner, name: { startsWith: "Copia de Valid fixture" } }, include: { players: true } });
      assert.equal(copies.length, 2); assert.notEqual(copies[0].name, copies[1].name);
      for (const copy of copies) {
        const saved = JSON.parse(copy.teams);
        assert.equal(saved[0].players[0], copy.players.find(p => p.name === source.players[0].name).id);
        assert.equal(saved[1].players[0], copy.players.find(p => p.name === source.players[1].name).id);
      }
    });

    await t.test("a failure after a real 50-player insert rolls back both the match and players", async () => {
      const source = await prisma.match.create({ data: { name: "Rollback fixture", userId: owner,
        players: { create: Array.from({ length: 100 }, (_, i) => ({ name: `Batch ${i}` })) } } });
      const matchesBefore = await prisma.match.count({ where: { userId: owner } });
      const playersBefore = await prisma.player.count({ where: { match: { userId: owner } } });
      let inserted = 0;
      const db = { $transaction: callback => prisma.$transaction(tx => callback(new Proxy(tx, {
        get(target, key) {
          if (key !== "player") return target[key];
          return new Proxy(target.player, { get(delegate, method) {
            if (method !== "createManyAndReturn") return delegate[method];
            return async args => {
              if (inserted) throw new Error("Forced failure after first database batch");
              const rows = await delegate.createManyAndReturn(args);
              inserted += rows.length; return rows;
            };
          } });
        },
      }))) };
      const result = await actionFor(owner, db)(source.id);
      assert.equal(inserted, 50); assert.equal(result.code, "unexpected");
      assert.equal(await prisma.match.count({ where: { userId: owner } }), matchesBefore);
      assert.equal(await prisma.player.count({ where: { match: { userId: owner } } }), playersBefore);
    });

    await t.test("concurrent copies of different matches respect the remaining match slot", async () => {
      const sources = await prisma.match.findMany({ where: { userId: owner }, take: 2 });
      const count = await prisma.match.count({ where: { userId: owner } });
      const previousLimit = process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER;
      process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER = String(count + 1);
      try {
        const results = await Promise.all(sources.map(source => actionFor(owner)(source.id)));
        assert.equal(results.filter(result => result.ok).length, 1);
        assert.equal(results.filter(result => result.code === "match_limit").length, 1);
        assert.equal(await prisma.match.count({ where: { userId: owner } }), count + 1);
      } finally {
        if (previousLimit === undefined) delete process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER;
        else process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER = previousLimit;
      }
    });
  } finally {
    await prisma.match.deleteMany({ where: { userId: owner } });
    await prisma.$disconnect();
  }
});
