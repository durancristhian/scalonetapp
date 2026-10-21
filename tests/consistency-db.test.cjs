const assert = require("node:assert/strict");
const { test, after } = require("node:test");
const { randomUUID } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");
const sourceLoader = require("./load-source.cjs");
const connection = process.env.DUPLICATION_TEST_DATABASE_URL;
const url = new URL(connection);
assert.ok(["127.0.0.1", "localhost"].includes(url.hostname));
assert.equal(url.pathname, "/scalonet_duplication_test");
const db = new PrismaClient({ datasourceUrl: connection });
after(() => db.$disconnect());
const load = sourceLoader({ "@/utils/prisma": db, "@clerk/nextjs/server": {} });
const matches = load("server/queries/match.ts");
const players = load("server/queries/player.ts");
async function fixture(run) {
  const owner = `consistency-${randomUUID()}`;
  try {
    const match = await db.match.create({ data: { name: "Fixture", userId: owner,
      players: { create: ["One", "Two", "Three", "Four"].map(name => ({ name })) } }, include: { players: true } });
    const teams = [{ id: "a", name: "A", players: match.players.slice(0, 2).map(p => p.id) },
      { id: "b", name: "B", players: match.players.slice(2).map(p => p.id) }];
    match.teams = JSON.stringify(teams);
    await db.match.update({ where: { id: match.id }, data: { teams: match.teams } });
    await run({ owner, match, teams });
  } finally { await db.match.deleteMany({ where: { userId: owner } }); }
}
test("an old tab cannot overwrite a newer valid lineup", async () => fixture(async ({ owner, match, teams }) => {
  const newer = JSON.stringify(teams.map(t => ({ ...t, name: t.name + " newer" })));
  await matches.editMatchQuery(match.id, { teams: newer, expectedTeams: match.teams }, owner);
  const stale = JSON.stringify(teams.map(t => ({ ...t, name: t.name + " stale" })));
  await assert.rejects(matches.editMatchQuery(match.id, { teams: stale, expectedTeams: match.teams }, owner), /cambió/);
  assert.equal((await db.match.findUnique({ where: { id: match.id } })).teams, newer);
}));
test("retrying identical saved content succeeds without another write", async () => fixture(async ({ owner, match }) => {
  const before = await db.match.findUnique({ where: { id: match.id } });
  await matches.editMatchQuery(match.id, { teams: match.teams, expectedTeams: "older" }, owner);
  assert.deepEqual(await db.match.findUnique({ where: { id: match.id } }), before);
}));
test("a team write must include the version it was edited from", async () => fixture(async ({ owner, match }) => {
  await assert.rejects(matches.editMatchQuery(match.id, { teams: match.teams }, owner));
}));
test("deleting a player repairs unusable legacy JSON on the server", async () => fixture(async ({ owner, match }) => {
  await db.match.update({ where: { id: match.id }, data: { teams: "not-json" } });
  await players.deletePlayerQuery(match.players[0].id, owner);
  const saved = await db.match.findUnique({ where: { id: match.id }, include: { players: true } });
  assert.equal(saved.teams, "[]"); assert.equal(saved.players.length, 3);
}));
test("renaming a player cannot bypass the duplicate-name rule", async () => fixture(async ({ owner, match }) => {
  await assert.rejects(players.editPlayerQuery(match.players[0].id, owner, { name: "Two", level: 5, position: "mid" }), /nombre/);
  assert.equal((await db.player.findUnique({ where: { id: match.players[0].id } })).name, "One");
}));
test("concurrent first-match creation respects names and the account limit", async () => {
  const owner = `consistency-${randomUUID()}`;
  const previous = process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER;
  process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER = "1";
  try {
    const results = await Promise.allSettled([1, 2].map(() => matches.addMatchQuery({ name: "Same" }, owner)));
    assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
    assert.equal(await db.match.count({ where: { userId: owner } }), 1);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER;
    else process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER = previous;
    await db.match.deleteMany({ where: { userId: owner } });
  }
});

test("concurrent match creation and duplication share the last account slot", async () => fixture(async ({ owner, match }) => {
  const old = process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER;
  process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER = "2";
  try {
    const duplicate = load("server/duplicate-match.ts").duplicateMatch;
    const results = await Promise.allSettled([matches.addMatchQuery({ name: "New" }, owner), duplicate(match.id, owner)]);
    const created = results.filter(r => r.status === "fulfilled" && r.value?.ok !== false);
    assert.equal(created.length, 1);
    assert.equal(await db.match.count({ where: { userId: owner } }), 2);
  } finally {
    if (old === undefined) delete process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER;
    else process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER = old;
  }
}));
test("concurrent renames cannot give two matches the same name", async () => fixture(async ({ owner, match }) => {
  const second = await matches.addMatchQuery({ name: "Second" }, owner);
  const results = await Promise.allSettled([match.id, second.id].map(id => matches.editMatchQuery(id, { name: "Same new name" }, owner)));
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(await db.match.count({ where: { userId: owner, name: "Same new name" } }), 1);
}));
test("foreign team saves and player edits leave the owner's data intact", async () => fixture(async ({ match }) => {
  await assert.rejects(matches.editMatchQuery(match.id, { teams: match.teams, expectedTeams: match.teams }, "foreign"));
  await assert.rejects(players.editPlayerQuery(match.players[0].id, "foreign", { name: "Changed", level: 5, position: "mid" }));
  assert.equal((await db.player.findUnique({ where: { id: match.players[0].id } })).name, "One");
}));
