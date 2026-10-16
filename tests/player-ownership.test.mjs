import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { after, beforeEach, describe, test } from "node:test";
import { z } from "zod";

// Real action, schema and query modules. Only framework boundaries are replaced.
// Run with: node --experimental-vm-modules --test tests/player-ownership.test.mjs
// Optional integration: SCALONETA_TEST_DATABASE_URL must name a dedicated local
// ownership_test database with the project's migrations already applied.
const root = new URL("../", import.meta.url);
const input = (name = "Updated player") => ({ name, level: 7, position: "def" });
const owners = ["ownership-test-a", "ownership-test-b"];

async function loadActions(prisma, session, invalidations) {
  const context = vm.createContext({ process: { env: {} } });
  const modules = new Map();
  const boundaries = {
    "@/utils/prisma": { default: prisma },
    "@clerk/nextjs/server": { auth: async () => ({ userId: session.userId }) },
    "next/cache": { revalidatePath: (...args) => invalidations.push(args) },
    "zod": { z },
  };
  function load(file) {
    if (modules.has(file)) return modules.get(file);
    const url = new URL(file, root);
    const source = stripTypeScriptTypes(readFileSync(url, "utf8"));
    const mod = new vm.SourceTextModule(source, { context, identifier: fileURLToPath(url) });
    modules.set(file, mod);
    return mod;
  }
  const mod = load("server/actions/player.ts");
  await mod.link((name) => {
      if (name in boundaries) {
        const values = boundaries[name];
        return new vm.SyntheticModule(Object.keys(values), function () {
          for (const [key, value] of Object.entries(values)) this.setExport(key, value);
        }, { context });
      }
      const allowed = {
        "@/schemas/player": "schemas/player.ts",
        "@/server/queries/player": "server/queries/player.ts",
        "@/utils/error-messages": "utils/error-messages.ts",
      };
      assert.ok(name in allowed, `Unexpected dependency: ${name}`);
      return load(allowed[name]);
  });
  await mod.evaluate();
  return mod.namespace;
}

function memoryDatabase() {
  let rows;
  const matches = [{ id: 1, userId: owners[0] }, { id: 2, userId: owners[1] }];
  const mutate = (args, remove) => {
    const row = rows.find((p) => p.id === args.where.id);
    if (!row || (args.where.match && matches.find((m) => m.id === row.matchId)?.userId !== args.where.match.userId)) {
      throw new Error("Record not found");
    }
    if (remove) rows = rows.filter((p) => p !== row);
    else Object.assign(row, args.data);
    return { ...row };
  };
  return {
    prisma: { player: { update: async (args) => mutate(args, false), delete: async (args) => mutate(args, true) } },
    async reset() {
      rows = matches.map((m) => ({ id: m.id, matchId: m.id, name: `Player ${m.id}`, level: 5, position: "mid", avatar: "" }));
      return { ownId: 1, foreignId: 2, foreignMatchId: 2 };
    },
    async read(id) { return rows.find((p) => p.id === id) ?? null; },
    async close() {},
  };
}

async function postgresDatabase(value) {
  const url = new URL(value);
  assert.ok(["postgres:", "postgresql:"].includes(url.protocol));
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(url.hostname), "Integration database must be local");
  assert.equal(url.pathname, "/ownership_test", "Use a dedicated ownership_test database");
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasourceUrl: value });
  const matchIds = [];
  return {
    prisma,
    async reset() {
      const matches = await Promise.all(owners.map((userId) => prisma.match.create({ data: {
        userId, name: "Ownership regression fixture", players: { create: { name: "Original", level: 5, position: "mid", avatar: "" } },
      }, include: { players: true } })));
      matchIds.push(...matches.map((m) => m.id));
      return { ownId: matches[0].players[0].id, foreignId: matches[1].players[0].id, foreignMatchId: matches[1].id };
    },
    read: (id) => prisma.player.findUnique({ where: { id } }),
    async close() {
      try { await prisma.match.deleteMany({ where: { id: { in: matchIds }, userId: { in: owners } } }); }
      finally { await prisma.$disconnect(); }
    },
  };
}

const backends = [["in-memory", memoryDatabase]];
if (process.env.SCALONETA_TEST_DATABASE_URL) {
  backends.push(["PostgreSQL", () => postgresDatabase(process.env.SCALONETA_TEST_DATABASE_URL)]);
}
for (const [name, createDatabase] of backends) {
  describe(`player ownership (${name})`, async () => {
    const db = await createDatabase();
    const session = { userId: owners[0] };
    const invalidations = [];
    let ids;
    let mutations = 0;
    const prisma = { player: {
      update: async (...args) => { mutations++; return db.prisma.player.update(...args); },
      delete: async (...args) => { mutations++; return db.prisma.player.delete(...args); },
    } };
    const actions = await loadActions(prisma, session, invalidations);
    beforeEach(async () => {
      ids = await db.reset();
      session.userId = owners[0];
      invalidations.length = 0;
      mutations = 0;
    });
    after(() => db.close());
    const call = (operation, id, data = input()) => operation === "edit"
      ? actions.editPlayerAction(id, data) : actions.deletePlayerAction(id);

    for (const operation of ["edit", "delete"]) {
      test(`${operation}: owner can mutate their player`, async () => {
        await call(operation, ids.ownId);
        const row = await db.read(ids.ownId);
        if (operation === "edit") {
          assert.equal(row.name, "Updated player");
          assert.equal(row.level, 7);
          assert.equal(row.position, "def");
        } else assert.equal(row, null);
        assert.deepEqual(invalidations, [["/partidos/[match-id]", "page"]]);
      });
      test(`${operation}: a second owner can mutate their own player`, async () => {
        session.userId = owners[1];
        await call(operation, ids.foreignId);
        assert.equal(operation === "edit" ? (await db.read(ids.foreignId)).name : await db.read(ids.foreignId), operation === "edit" ? "Updated player" : null);
      });
      test(`${operation}: another owner's player is unchanged`, async () => {
        const before = await db.read(ids.foreignId);
        let foreignError;
        await assert.rejects(() => call(operation, ids.foreignId), (error) => { foreignError = error.message; return true; });
        assert.deepEqual(await db.read(ids.foreignId), before);
        await assert.rejects(() => call(operation, 2147483647), (error) => error.message === foreignError);
        assert.equal(invalidations.length, 0);
      });
      test(`${operation}: signed-out request never reaches a mutation`, async () => {
        session.userId = null;
        await assert.rejects(() => call(operation, ids.ownId));
        assert.equal(mutations, 0);
        assert.equal(invalidations.length, 0);
        assert.ok(await db.read(ids.ownId));
      });
      test(`${operation}: invalid IDs never reach a mutation`, async () => {
        for (const id of [0, -1, 1.5, "1", null, undefined, NaN, Infinity, 2147483648]) {
          await assert.rejects(() => call(operation, id));
        }
        assert.equal(mutations, 0);
        assert.equal(invalidations.length, 0);
      });
    }
    test("edit: invalid player fields are rejected before mutation", async () => {
      const before = await db.read(ids.ownId);
      for (const data of [null, {}, { ...input(), name: " " }, { ...input(), name: "a".repeat(41) },
        { ...input(), level: 0 }, { ...input(), level: 11 }, { ...input(), level: 1.5 },
        { ...input(), level: "5" }, { ...input(), position: "invalid" }, { ...input(), avatar: 10 }]) {
        await assert.rejects(() => call("edit", ids.ownId, data));
      }
      assert.equal(mutations, 0);
      assert.deepEqual(await db.read(ids.ownId), before);
    });
    test("edit: relationship and identity payloads cannot move or reassign a player", async () => {
      const before = await db.read(ids.ownId);
      for (const extra of [{ matchId: ids.foreignMatchId }, { match: { connect: { id: ids.foreignMatchId } } },
        { match: { update: { userId: owners[1] } } }, { userId: owners[1] }, { id: ids.foreignId }, { createdAt: new Date() }]) {
        await assert.rejects(() => call("edit", ids.ownId, { ...input(), ...extra }));
      }
      assert.equal(mutations, 0);
      assert.deepEqual(await db.read(ids.ownId), before);
    });
    test("edit: trims names and preserves an omitted optional avatar", async () => {
      await call("edit", ids.ownId, { ...input("  Valid name  "), avatar: "https://example.invalid/player.png" });
      await call("edit", ids.ownId, input("  Trimmed name  "));
      const row = await db.read(ids.ownId);
      assert.equal(row.name, "Trimmed name");
      assert.equal(row.avatar, "https://example.invalid/player.png");
    });
  });
}
