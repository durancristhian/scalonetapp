const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test, after } = require("node:test");
const { randomUUID } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");
const sourceLoader = require("./load-source.cjs");

const connection = process.env.DUPLICATION_TEST_DATABASE_URL;
if (!connection) throw new Error("Set DUPLICATION_TEST_DATABASE_URL to a dedicated local scalonet_duplication_test database");
const url = new URL(connection);
assert.ok(["127.0.0.1", "localhost"].includes(url.hostname));
assert.equal(url.pathname, "/scalonet_duplication_test");
const prisma = new PrismaClient({ datasourceUrl: connection });
after(() => prisma.$disconnect());

function queries(db = prisma) {
  const load = sourceLoader({ "@/utils/prisma": db, "@clerk/nextjs/server": {} });
  return { remove: load("server/queries/player.ts").deletePlayerQuery,
    save: load("server/queries/match.ts").editMatchQuery };
}
async function fixture(run, count = 4) {
  const owner = `player-teams-test-${randomUUID()}`;
  try {
    const match = await prisma.match.create({ data: { name: "Fixture", userId: owner,
      players: { create: Array.from({ length: count }, (_, i) => ({ name: `Fixture ${i}` })) } }, include: { players: true } });
    const teams = [{ id: "a", name: "Equipo A", players: match.players.slice(0, 2).map(p => p.id) },
      { id: "b", name: "Equipo B", players: match.players.slice(2, 4).map(p => p.id) }];
    match.teams = JSON.stringify(teams);
    await prisma.match.update({ where: { id: match.id }, data: { teams: match.teams } });
    await run({ owner, match, teams });
  } finally { await prisma.match.deleteMany({ where: { userId: owner } }); }
}
function transactionProxy(override) {
  return { $transaction: callback => prisma.$transaction(tx => callback(new Proxy(tx, {
    get(target, key) { return override(target, key) ?? target[key]; },
  }))) };
}
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }

test("deleting an assigned player persists the remaining saved teams", async () => {
  await fixture(async ({ owner, match, teams }) => {
    const deleted = await queries().remove(match.players[0].id, owner);
    assert.equal(deleted.id, match.players[0].id);
    const saved = await prisma.match.findUnique({ where: { id: match.id } });
    assert.deepEqual(JSON.parse(saved.teams), [{ ...teams[0], players: [match.players[1].id] }, teams[1]]);
    assert.equal(await prisma.player.count({ where: { matchId: match.id } }), 3);
  });
});

test("deleting an unassigned player preserves saved teams byte for byte", async () => {
  await fixture(async ({ owner, match }) => {
    const formatted = JSON.stringify(JSON.parse(match.teams), null, 2);
    await prisma.match.update({ where: { id: match.id }, data: { teams: formatted } });
    await queries().remove(match.players[4].id, owner);
    assert.equal((await prisma.match.findUnique({ where: { id: match.id } })).teams, formatted);
  }, 5);
});

test("removing the last player in a team keeps its name and empty team", async () => {
  await fixture(async ({ owner, match, teams }) => {
    await queries().remove(match.players[0].id, owner);
    await queries().remove(match.players[1].id, owner);
    assert.deepEqual(JSON.parse((await prisma.match.findUnique({ where: { id: match.id } })).teams), [{ ...teams[0], players: [] }, teams[1]]);
  });
});

test("a saved-team write failure rolls back the player deletion", async () => {
  await fixture(async ({ owner, match }) => {
    const db = transactionProxy((tx, key) => key === "match" ? new Proxy(tx.match, {
      get(target, method) { return method === "update" ? async () => { throw new Error("Synthetic team write failure"); } : target[method]; },
    }) : undefined);
    await assert.rejects(queries(db).remove(match.players[0].id, owner), /Synthetic team write failure/);
    assert.equal(await prisma.player.count({ where: { matchId: match.id } }), 4);
    assert.equal((await prisma.match.findUnique({ where: { id: match.id } })).teams, match.teams);
  });
});

test("foreign and nonexistent player deletions never change saved teams", async () => {
  await fixture(async ({ owner, match }) => {
    await assert.rejects(queries().remove(match.players[0].id, "other-owner"));
    await assert.rejects(queries().remove(2147483647, owner));
    assert.equal(await prisma.player.count({ where: { matchId: match.id } }), 4);
    assert.equal((await prisma.match.findUnique({ where: { id: match.id } })).teams, match.teams);
  });
});

test("concurrent deletions keep both removals in the saved teams", async () => {
  await fixture(async ({ owner, match, teams }) => {
    await Promise.all([queries().remove(match.players[0].id, owner), queries().remove(match.players[1].id, owner)]);
    assert.deepEqual(JSON.parse((await prisma.match.findUnique({ where: { id: match.id } })).teams), [{ ...teams[0], players: [] }, teams[1]]);
  });
});

test("a save validated before deletion finishes first, then deletion cleans its result", async () => {
  await fixture(async ({ owner, match, teams }) => {
    const read = deferred(), release = deferred();
    const db = transactionProxy((tx, key) => key === "player" ? new Proxy(tx.player, {
      get(target, method) {
        if (method !== "findMany") return target[method];
        return async args => { const rows = await target.findMany(args); read.resolve(); await release.promise; return rows; };
      },
    }) : undefined);
    const saving = queries(db).save(match.id, { teams: match.teams, expectedTeams: match.teams }, owner);
    await read.promise;
    const deleting = queries().remove(match.players[0].id, owner);
    release.resolve();
    await Promise.all([saving, deleting]);
    assert.deepEqual(JSON.parse((await prisma.match.findUnique({ where: { id: match.id } })).teams), [{ ...teams[0], players: [match.players[1].id] }, teams[1]]);
  });
});

test("a save waiting behind deletion cannot reintroduce the deleted player", async () => {
  await fixture(async ({ owner, match }) => {
    const removed = deferred(), release = deferred(), saveStarted = deferred();
    const db = transactionProxy((tx, key) => key === "player" ? new Proxy(tx.player, {
      get(target, method) {
        if (method !== "delete") return target[method];
        return async args => { const row = await target.delete(args); removed.resolve(); await release.promise; return row; };
      },
    }) : undefined);
    const deleting = queries(db).remove(match.players[0].id, owner);
    await removed.promise;
    const savingDb = {
      // Also supports the old nontransactional path, so this test would catch
      // validation of an old roster followed by a write after the deletion.
      player: { findMany: async args => {
        const rows = await prisma.player.findMany(args); saveStarted.resolve(); return rows;
      } },
      match: prisma.match,
      $transaction: transactionProxy((tx, key) => key === "$queryRaw" ? (...args) => {
        saveStarted.resolve(); return tx.$queryRaw(...args);
      } : undefined).$transaction,
    };
    const saving = queries(savingDb).save(match.id, { teams: match.teams, expectedTeams: match.teams }, owner);
    const assertion = assert.rejects(saving, /cambió/);
    await saveStarted.promise;
    release.resolve();
    await Promise.all([deleting, assertion]);
    assert.ok(!JSON.parse((await prisma.match.findUnique({ where: { id: match.id } })).teams).flatMap(t => t.players).includes(match.players[0].id));
  });
});

test("migration removes only nonmembers, preserves the rest, and is idempotent", async () => {
  await fixture(async ({ owner, match, teams }) => {
    const foreign = await prisma.match.create({ data: { name: "Other fixture", userId: owner,
      players: { create: [{ name: "Other player" }] } }, include: { players: true } });
    const corrupt = [{ ...teams[0], extra: { preserved: true }, players: [...teams[0].players, foreign.players[0].id, 2147483647, "bad", null] }, teams[1]];
    await prisma.match.update({ where: { id: match.id }, data: { teams: JSON.stringify(corrupt) } });
    const untouched = await prisma.match.create({ data: { name: "Unchanged fixture", userId: owner, teams: " [ ] " } });
    const malformed = await prisma.match.create({ data: { name: "Malformed fixture", userId: owner, teams: "not json" } });
    const unknown = await prisma.match.create({ data: { name: "Unknown shape", userId: owner,
      teams: '[{"id":"legacy","players":"unknown"}]' } });
    const empty = await prisma.match.create({ data: { name: "Empty after cleanup", userId: owner,
      teams: JSON.stringify([{ id: "empty", name: "Keep this team", players: [2147483647] }]) } });
    const before = await prisma.match.findUnique({ where: { id: match.id } });
    const count = await prisma.player.count();
    const sql = fs.readFileSync(path.join(__dirname, "../prisma/migrations/20261021220000_remove_stale_team_players/migration.sql"), "utf8");
    await prisma.$executeRawUnsafe(sql);
    const after = await prisma.match.findUnique({ where: { id: match.id } });
    assert.deepEqual(JSON.parse(after.teams), [{ ...teams[0], extra: { preserved: true } }, teams[1]]);
    assert.deepEqual({ ...after, teams: before.teams }, before);
    assert.equal(await prisma.player.count(), count);
    assert.equal((await prisma.match.findUnique({ where: { id: untouched.id } })).teams, untouched.teams);
    assert.equal((await prisma.match.findUnique({ where: { id: malformed.id } })).teams, malformed.teams);
    assert.equal((await prisma.match.findUnique({ where: { id: unknown.id } })).teams, unknown.teams);
    assert.deepEqual(JSON.parse((await prisma.match.findUnique({ where: { id: empty.id } })).teams), [{ id: "empty", name: "Keep this team", players: [] }]);
    await prisma.$executeRawUnsafe(sql);
    assert.deepEqual(await prisma.match.findUnique({ where: { id: match.id } }), after);
  });
});
