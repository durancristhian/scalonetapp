const assert = require("node:assert/strict");
const { test } = require("node:test");
const { PassThrough } = require("node:stream");
const sourceLoader = require("./load-source.cjs");

function fixture(teams = "[]", count = 2) {
  return { id: 1, userId: "owner", name: "Partido", teams,
    players: Array.from({ length: count }, (_, i) => ({ id: i + 10, name: `Jugador ${i}`, level: 5, position: "mid", avatar: "" })) };
}
const validTeams = JSON.stringify([
  { id: "a", name: "A", players: [10] }, { id: "b", name: "B", players: [11] },
]);

function setup(original = fixture(), options = {}) {
  const state = { matches: original ? [structuredClone(original)] : [], nextPlayerId: 100 };
  const logs = [], revalidated = [];
  let insertCalls = 0;
  function database(current) {
    return {
      $queryRaw: async () => [{ id: 1 }],
      match: {
        findFirst: async ({ where }) => current.matches.find(m => m.id === where.id && m.userId === where.userId) ?? null,
        findMany: async () => options.atLimit ? Array.from({ length: 100 }, (_, i) => ({ name: `Other ${i}` })) : current.matches,
        create: async ({ data }) => {
          const match = { ...data, id: current.matches.length + 1, teams: "[]", players: [] };
          current.matches.push(match); return match;
        },
        update: async ({ where, data }) => {
          if (options.failTeams) throw new Error("synthetic team write failed");
          const match = current.matches.find(m => m.id === where.id);
          Object.assign(match, data); return match;
        },
      },
      player: {
        createManyAndReturn: async ({ data }) => {
          insertCalls++;
          if (options.failInsert === insertCalls) throw new Error("synthetic player write failed");
          const players = data.map(p => ({ ...p, id: current.nextPlayerId++ }));
          for (const p of players) current.matches.find(m => m.id === p.matchId).players.push(p);
          // PostgreSQL does not promise RETURNING order.
          return players.reverse();
        },
      },
    };
  }
  const db = database(state);
  db.$transaction = async callback => {
    const pending = structuredClone(state);
    const result = await callback(database(pending));
    Object.assign(state, pending); return result;
  };
  const load = sourceLoader({
    "@/utils/prisma": db,
    "@/server/player-photos": {},
    "@clerk/nextjs/server": { auth: async () => {
      if (options.authFailure) throw new Error("synthetic auth service failure");
      return { userId: options.signedOut ? null : "owner" };
    } },
    "date-fns": { format: () => "1234567890" },
    "next/cache": { revalidatePath: path => {
      if (options.failRevalidation) throw new Error("synthetic refresh failure");
      revalidated.push(path);
    } },
    console: { error: (...args) => logs.push(args) },
  });
  return { action: load("server/actions/match.ts").duplicateMatchAction, state, logs, revalidated };
}

test("stale saved player IDs copy the current roster with teams reset", async () => {
  const source = fixture(validTeams.replace("10", "999"));
  const { action, state } = setup(source);
  const result = await action(1);
  assert.deepEqual(result, { ok: true, teamsReset: true });
  assert.deepEqual(state.matches[0], source);
  assert.equal(state.matches[1].players.length, 2);
  assert.equal(state.matches[1].teams, "[]");
});

test("valid teams remap to the copied players even when insert results are reversed", async () => {
  const { action, state, revalidated } = setup(fixture(validTeams));
  assert.deepEqual(await action(1), { ok: true, teamsReset: false });
  const copy = state.matches[1];
  const teams = JSON.parse(copy.teams);
  assert.equal(teams[0].players[0], copy.players.find(p => p.name === "Jugador 0").id);
  assert.equal(teams[1].players[0], copy.players.find(p => p.name === "Jugador 1").id);
  assert.deepEqual(revalidated, ["/dashboard", "/partidos"]);
});

for (const teams of ["not-json", "null", "{}", '[{"id":"a"}]', validTeams.replace("[11]", "[10]")]) {
  test(`invalid saved teams recover without an exception: ${teams}`, async () => {
    const { action, state } = setup(fixture(teams));
    assert.deepEqual(await action(1), { ok: true, teamsReset: true });
    assert.equal(state.matches[1].teams, "[]");
  });
}

test("an empty match duplicates without a misleading team-reset warning", async () => {
  const { action, state } = setup(fixture("[]", 0));
  assert.deepEqual(await action(1), { ok: true, teamsReset: false });
  assert.equal(state.matches[1].players.length, 0);
});

test("unassigned new roster players reset saved teams", async () => {
  const { action } = setup(fixture(validTeams, 3));
  assert.deepEqual(await action(1), { ok: true, teamsReset: true });
});

test("legacy duplicate names with different attributes retain the correct team mapping", async () => {
  const source = fixture(validTeams);
  source.players[1].name = source.players[0].name;
  source.players[1].level = 8;
  const { action, state } = setup(source);
  assert.equal((await action(1)).ok, true);
  const copy = state.matches[1];
  assert.equal(JSON.parse(copy.teams)[1].players[0], copy.players.find(p => p.level === 8).id);
});

test("100-player rosters copy in batches", async () => {
  const { action, state } = setup(fixture("[]", 100));
  assert.equal((await action(1)).ok, true);
  assert.equal(state.matches[1].players.length, 100);
});

test("a later batch failure rolls back the whole copy and reports the original error", async () => {
  const { action, state, logs } = setup(fixture("[]", 100), { failInsert: 2 });
  const result = await action(1);
  assert.equal(result.ok, false); assert.equal(result.code, "unexpected");
  assert.match(result.reference, /^[0-9a-f]{12}$/);
  assert.equal(state.matches.length, 1);
  assert.equal(logs.length, 1);
  assert.ok(logs[0].some(item => item instanceof Error && item.message === "synthetic player write failed"));
  assert.ok(logs[0].some(item => item.reference === result.reference && item.matchId === 1));
});

test("a team write failure also rolls back the whole copy", async () => {
  const { action, state } = setup(fixture(validTeams), { failTeams: true });
  assert.equal((await action(1)).ok, false);
  assert.equal(state.matches.length, 1);
});

for (const [name, source, options, code] of [
  ["signed out", fixture(), { signedOut: true }, "unauthorized"],
  ["foreign owner", { ...fixture(), userId: "other" }, {}, "not_found"],
  ["missing match", null, {}, "not_found"],
  ["match limit", fixture(), { atLimit: true }, "match_limit"],
  ["player limit", fixture("[]", 101), {}, "player_limit"],
]) {
  test(`${name} returns an expected failure without writing or logging an exception`, async () => {
    const { action, state, logs } = setup(source, options);
    const before = structuredClone(state);
    assert.deepEqual(await action(1), { ok: false, code });
    assert.deepEqual(state, before); assert.equal(logs.length, 0);
  });
}

test("revalidation failure after commit still returns success and reports separately", async () => {
  const { action, state, logs } = setup(fixture(), { failRevalidation: true });
  assert.equal((await action(1)).ok, true);
  assert.equal(state.matches.length, 2); assert.equal(logs.length, 1);
});

test("repeated copies of a long name stay distinct and within 40 characters", async () => {
  const { action, state } = setup({ ...fixture(), name: "A".repeat(40) });
  await action(1); await action(1);
  assert.notEqual(state.matches[1].name, state.matches[2].name);
  assert.ok(state.matches[1].name.length <= 40 && state.matches[2].name.length <= 40);
});

test("auth service failures return a correlation reference without exposing the exception", async () => {
  const { action, logs } = setup(fixture(), { authFailure: true });
  const result = await action(1);
  assert.equal(result.code, "unexpected"); assert.match(result.reference, /^[0-9a-f]{12}$/);
  assert.equal(logs.length, 1);
  assert.doesNotMatch(JSON.stringify(result), /synthetic auth/);
});

for (const id of [-1, 0, 0.1, NaN, 2147483648, "1"]) {
  test(`invalid match ID ${id} never creates a copy`, async () => {
    const { action, state } = setup();
    assert.deepEqual(await action(id), { ok: false, code: "not_found" });
    assert.equal(state.matches.length, 1);
  });
}

function client(action) {
  const alerts = [], successes = [];
  let closed = 0;
  const jsx = (type, props) => ({ type, props });
  const load = sourceLoader({
    "@/server/actions/match": { duplicateMatchAction: action },
    "@/utils/analytics": { trackAnalytics() {} },
    "@/app/(authenticated)/(hooks)/use-alerts": { useAlerts: () => ({ errorAlert: a => alerts.push(a), successAlert: a => successes.push(a) }) },
    react: { useState: v => [v, () => {}], useRef: v => ({ current: v }) },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "@/components/ui/alert-dialog": new Proxy({}, { get: (_, key) => key }),
    "@/components/ui/button": { Button: "Button" },
    "@/components/soccer-ball": { SoccerBall: "SoccerBall" },
  });
  const tree = load("app/(authenticated)/(components)/duplicate-match.tsx").DuplicateMatch({ id: 1, onClose: () => closed++ });
  function find(node) {
    if (!node || typeof node !== "object") return;
    if (node.props?.onClick?.constructor.name === "AsyncFunction") return node.props.onClick;
    for (const child of [node.props?.children].flat(Infinity)) { const found = find(child); if (found) return found; }
  }
  return { click: find(tree), alerts, successes, closed: () => closed };
}

test("the screenshot's production Flight error never reaches the toast", async () => {
  const { renderToPipeableStream } = require("next/dist/compiled/react-server-dom-webpack/server.node");
  const { createFromNodeStream } = require("next/dist/compiled/react-server-dom-webpack/client.node");
  const ui = client(async () => {
    const stream = new PassThrough();
    const result = createFromNodeStream(stream, { moduleMap: {}, serverModuleMap: {}, moduleLoading: null });
    renderToPipeableStream(Promise.reject(new Error("synthetic private database cause")), {}, { onError: () => "synthetic-digest" }).pipe(stream);
    return await result;
  });
  await ui.click();
  assert.equal(ui.alerts[0].title, "Ocurrió un error al duplicar el partido. Por favor, intente nuevamente.");
  assert.equal(ui.successes.length, 0); assert.equal(ui.closed(), 0);
});

test("returned errors show only the allowlisted message and reference", async () => {
  const ui = client(async () => ({ ok: false, code: "unexpected", reference: "event-reference" }));
  await ui.click();
  assert.match(ui.alerts[0].title, /duplicar el partido/);
  assert.equal(ui.alerts[0].description, "Referencia: event-reference");
  assert.equal(ui.closed(), 0);
});

test("rapid double-clicks submit once and success explains reset teams", async () => {
  let resolve, calls = 0;
  const ui = client(() => { calls++; return new Promise(r => { resolve = r; }); });
  const first = ui.click(); await ui.click();
  assert.equal(calls, 1);
  resolve({ ok: true, teamsReset: true }); await first;
  assert.match(ui.successes[0].description, /Volvé a armar/);
  assert.equal(ui.closed(), 1);
});
