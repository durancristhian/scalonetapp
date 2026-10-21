const assert = require("node:assert/strict");
const { test } = require("node:test");
const { PassThrough } = require("node:stream");
const sourceLoader = require("./load-source.cjs");
const validPlayer = { name: "Fixture", level: 5, position: "mid" };

function actions(options = {}) {
  const logs = [], writes = [];
  const work = async (...args) => { if (options.fail) throw Error("private database details"); writes.push(args); return { id: 1, avatar: "" }; };
  const load = sourceLoader({
    "@/server/queries/player": { addPlayerQuery: work, addMultiplePlayersQuery: work, editPlayerQuery: work, deletePlayerQuery: work },
    "@/server/queries/match": { addMatchQuery: work, editMatchQuery: work, deleteMatchQuery: work },
    "@/server/player-photos": { removeUnusedPhoto() {} },
    "@/utils/prisma": { player: { findMany: async () => [] } },
    "@clerk/nextjs/server": { auth: async () => ({ userId: options.signedOut ? null : "owner" }) },
    "next/cache": { revalidatePath() { if (options.refreshFailure) throw Error("refresh failed"); } },
    console: { error: (...args) => logs.push(args) },
  });
  return { player: load("server/actions/player.ts"), match: load("server/actions/match.ts"), load, logs, writes };
}
const mutations = [
  ["player", "addPlayerAction", [1, validPlayer]], ["player", "addMultiplePlayersAction", [1, [validPlayer]]],
  ["player", "editPlayerAction", [1, validPlayer]], ["player", "deletePlayerAction", [1]],
  ["match", "addMatchAction", [{ name: "Fixture" }]], ["match", "editMatchAction", [1, { name: "Fixture" }]],
  ["match", "deleteMatchAction", [1]],
];
for (const [group, name, args] of mutations) {
  test(`${name}: unexpected errors are safe results with the original cause logged`, async () => {
    const app = actions({ fail: true });
    const result = await app[group][name](...args);
    assert.equal(result.ok, false); assert.match(result.reference, /^[0-9a-f]{12}$/);
    assert.doesNotMatch(JSON.stringify(result), /private database|Server Components/);
    assert.ok(app.logs[0].some(item => item instanceof Error && item.message === "private database details"));
  });
  test(`${name}: signed-out callers cannot write`, async () => {
    const app = actions({ signedOut: true });
    assert.equal((await app[group][name](...args)).ok, false);
    assert.equal(app.writes.length, 0); assert.equal(app.logs.length, 0);
  });
  test(`${name}: refresh failure after commit still reports success`, async () => {
    const app = actions({ refreshFailure: true });
    assert.equal((await app[group][name](...args)).ok, true);
    assert.equal(app.writes.length, 1); assert.equal(app.logs.length, 1);
  });
}
test("a failed player edit crosses production Flight without exposing a framework exception", async () => {
  const { renderToPipeableStream } = require("next/dist/compiled/react-server-dom-webpack/server.node");
  const { createFromNodeStream } = require("next/dist/compiled/react-server-dom-webpack/client.node");
  const app = actions({ fail: true }), stream = new PassThrough();
  const result = createFromNodeStream(stream, { moduleMap: {}, serverModuleMap: {}, moduleLoading: null });
  renderToPipeableStream(app.player.editPlayerAction(1, validPlayer), {}, { onError: () => "should-not-throw" }).pipe(stream);
  assert.equal((await result).ok, false);
  const { getActionErrorMessage, unwrapActionResult } = app.load("utils/action-result.ts");
  assert.equal(getActionErrorMessage(Error("An error occurred in the Server Components render"), "safe fallback"), "safe fallback");
  assert.throws(() => unwrapActionResult({ ok: false, error: "Expected alert" }), /Expected alert/);
});

function lineup() {
  const players = [1, 2].map(id => ({ id, name: `Player ${id}`, level: 5, position: "mid", avatar: "" }));
  const teams = players.map(p => ({ id: `t${p.id}`, name: `Team ${p.id}`, players: [p] }));
  return { players, teams, match: { id: 1, name: "Fixture", players,
    teams: JSON.stringify(teams.map(t => ({ ...t, players: t.players.map(p => p.id) }))) } };
}
test("export refuses a changed lineup or player before starting Chromium", async () => {
  const { players, teams, match } = lineup();
  const load = sourceLoader({ "@/server/queries/match": { getMatchByIdQuery: async () => match },
    "@/utils/image-export-target": { getImageExportTarget: () => ({ origin: "http://localhost:3000" }), ImageExportConfigurationError: class extends Error {} } });
  const fingerprint = await load("utils/lineup-fingerprint.ts").lineupFingerprint(match.name, teams);
  const route = load("app/(not-authenticated)/download/[match-id]/route.ts");
  for (const change of [() => { players[0].name = "Updated"; }, () => { match.name = "Renamed"; }, () => { match.teams = match.teams.replace("Team 1", "Other team"); }]) {
    change();
    const request = new Request("http://localhost:3000/download/1", { headers: { "X-Lineup-Fingerprint": fingerprint } });
    request.nextUrl = new URL(request.url);
    assert.equal((await route.GET(request)).status, 409);
  }
});
test("malformed saved JSON returns an existing validation response instead of crashing export", async () => {
  const { match } = lineup(); match.teams = "not-json";
  const load = sourceLoader({ "@/server/queries/match": { getMatchByIdQuery: async () => match },
    "@/utils/image-export-target": { getImageExportTarget: () => ({ origin: "http://localhost:3000" }), ImageExportConfigurationError: class extends Error {} } });
  const request = new Request("http://localhost:3000/download/1"); request.nextUrl = new URL(request.url);
  assert.equal((await load("app/(not-authenticated)/download/[match-id]/route.ts").GET(request)).status, 422);
});
test("the export client sends the preview fingerprint and rejects a conflict response", async () => {
  const original = global.fetch; let received;
  try {
    global.fetch = async (_, options) => { received = options; return new Response("changed", { status: 409 }); };
    const load = sourceLoader({});
    await assert.rejects(load("utils/fetch-team-export.ts").fetchTeamExport(1, undefined, {}, "fixture-hash"));
    assert.equal(received.headers["X-Lineup-Fingerprint"], "fixture-hash");
  } finally { global.fetch = original; }
});

for (const entity of ["player", "match"]) {
  test(`delete ${entity}: double clicks submit once and transport errors keep the dialog open with safe copy`, async () => {
    let calls = 0, close = 0, reject;
    const alerts = [], promise = new Promise((_, no) => { reject = no; });
    const jsx = (type, props) => ({ type, props });
    const load = sourceLoader({
      [`@/server/actions/${entity}`]: { [entity === "player" ? "deletePlayerAction" : "deleteMatchAction"]: () => { calls++; return promise; } },
      "@/app/(authenticated)/(hooks)/use-alerts": { useAlerts: () => ({ errorAlert: alert => alerts.push(alert), successAlert() {} }) },
      react: { useState: value => [value, () => {}], useRef: value => ({ current: value }) },
      "react/jsx-runtime": { jsx, jsxs: jsx },
      "@/components/ui/alert-dialog": new Proxy({}, { get: (_, key) => key }),
      "@/components/ui/button": { Button: "Button" },
      "@/components/soccer-ball": { SoccerBall: "SoccerBall" },
    });
    const file = entity === "player" ? "app/(authenticated)/partidos/[match-id]/(components)/delete-player.tsx" : "app/(authenticated)/(components)/delete-match.tsx";
    const component = load(file)[entity === "player" ? "DeletePlayer" : "DeleteMatch"];
    const tree = component({ id: 1, onClose: () => close++ });
    const nodes = [];
    function visit(node) { if (!node || typeof node !== "object") return; nodes.push(node); for (const child of [node.props?.children].flat(Infinity)) visit(child); }
    visit(tree);
    const button = nodes.find(n => n.type === "Button");
    const pending = button.props.onClick(); await button.props.onClick(); assert.equal(calls, 1);
    let prevented = false;
    nodes.find(n => n.type === "AlertDialogContent").props.onEscapeKeyDown({ preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    reject(Error("An error occurred in the Server Components render")); await pending;
    assert.equal(close, 0); assert.equal(alerts.length, 1);
    assert.doesNotMatch(alerts[0].title, /Server Components/);
  });
}

test("invalid IDs and undeclared player fields never reach the database", async () => {
  const app = actions();
  assert.equal((await app.player.addPlayerAction(-1, validPlayer)).ok, false);
  assert.equal((await app.player.editPlayerAction(1, { ...validPlayer, matchId: 2 })).ok, false);
  assert.equal((await app.match.editMatchAction(1, { teams: "[]" })).ok, false);
  assert.equal(app.writes.length, 0);
});

test("the builder disables native edit controls while saving or exporting", () => {
  const { match, teams } = lineup();
  const jsx = (type, props) => ({ type, props });
  for (const operation of ["save", "export", null]) {
    const load = sourceLoader({
      react: { useMemo: callback => callback() }, "react/jsx-runtime": { jsx, jsxs: jsx },
      "@/app/(authenticated)/partidos/[match-id]/(hooks)/use-team-builder-state": { useTeamsBuilderState: () => ({ teams, unselectedPlayers: [], selectedIds: [] }) },
      "@/app/(authenticated)/partidos/[match-id]/(hooks)/use-team-actions": { useTeamActions: () => ({ operation }) },
      ...Object.fromEntries(["assign-players", "build-teams", "copy-teams", "export-teams", "match-players", "save-teams", "team-card"].map(name => [
        `@/app/(authenticated)/partidos/[match-id]/(components)/${name}`, {},
      ])),
      "@/components/empty-state": {}, "@/components/ui/button": {},
    });
    const root = load("app/(authenticated)/partidos/[match-id]/(components)/match-details.tsx").MatchDetails({ match });
    assert.equal(root.type, "fieldset");
    assert.equal(root.props.disabled, operation !== null);
  }
});
