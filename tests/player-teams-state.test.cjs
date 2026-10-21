const assert = require("node:assert/strict");
const { test } = require("node:test");
const sourceLoader = require("./load-source.cjs");

// Run the real hooks across refreshed server props and their effects.
function hookState() {
  const slots = [];
  let cursor = 0, changed = false, effects = [];
  return {
    react: {
      useState(initial) {
        const i = cursor++;
        if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial;
        return [slots[i], value => {
          const next = typeof value === "function" ? value(slots[i]) : value;
          if (!Object.is(next, slots[i])) { slots[i] = next; changed = true; }
        }];
      },
      useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
      useEffect(effect, deps) {
        const i = cursor++;
        if (!slots[i] || deps.some((value, n) => !Object.is(value, slots[i][n]))) effects.push(effect);
        slots[i] = deps;
      },
    },
    render(callback) {
      let result;
      for (let round = 0; round < 10; round++) {
        cursor = 0; changed = false; effects = [];
        result = callback();
        for (const effect of effects) effect();
        if (!changed) return result;
      }
      throw new Error("Hook effects did not settle");
    },
  };
}

function setup() {
  const state = hookState(), writes = [];
  const load = sourceLoader({
    react: state.react,
    "@/server/actions/match": { editMatchAction: async (...args) => { writes.push(args); return { ok: true }; } },
    "@/utils/analytics": { trackAnalytics() {} },
    "@/utils/image-export-player-roles": { invalidateImageExportTeamSelections() {} },
    "@/app/(authenticated)/(hooks)/use-alerts": { useAlerts: () => ({ successAlert() {}, errorAlert() {} }) },
  });
  const builder = load("app/(authenticated)/partidos/[match-id]/(hooks)/use-team-builder-state.ts").useTeamsBuilderState;
  const actions = load("app/(authenticated)/partidos/[match-id]/(hooks)/use-team-actions.ts").useTeamActions;
  const serialize = load("utils/get-teams-to-save.ts").getTeamsToSave;
  let match = { id: 1, players: Array.from({ length: 4 }, (_, i) => ({ id: i + 10, name: `Fixture ${i}`, level: 5, position: "mid" })),
    teams: JSON.stringify([{ id: "a", name: "A", players: [10, 11] }, { id: "b", name: "B", players: [12, 13] }]) };
  return { writes, serialize,
    render: () => state.render(() => { const b = builder(match); return { ...b, actions: actions(match, b.teams, true, b.baseTeams) }; }),
    remove: () => { match = { ...match, players: match.players.slice(1), teams: JSON.stringify(JSON.parse(match.teams).map(t => ({ ...t, players: t.players.filter(id => id !== 10) }))) }; },
    acknowledge: () => { match = { ...match, teams: writes.at(-1)[1].teams }; },
    saved: () => match.teams,
    remote: () => { match = { ...match, teams: JSON.stringify([{ id: "a", name: "Remote A", players: [10, 12] }, { id: "b", name: "Remote B", players: [11, 13] }]) }; },
    malformed: value => { match = { ...match, teams: value }; },
  };
}

test("refreshed deletion removes the player from teams and selection, and is already saved", async () => {
  const app = setup();
  let state = app.render();
  state.togglePlayer(10); state = app.render();
  assert.deepEqual(state.selectedIds, [10]);
  app.remove(); state = app.render();
  assert.deepEqual(state.selectedIds, []);
  assert.equal(app.serialize(state.teams), app.saved());
  await state.actions.save();
  assert.equal(app.writes.length, 0);
});

test("a pristine tab follows refreshed saved teams automatically", () => {
  const app = setup(); app.render(); app.remote();
  const state = app.render();
  assert.equal(app.serialize(state.teams), app.saved());
  assert.equal(state.baseTeams, app.saved());
});

test("a dirty tab preserves its draft and old version after another tab saves", async () => {
  const app = setup(); let state = app.render();
  const base = state.baseTeams;
  state.updateTeamName("a", "Local draft"); state = app.render();
  app.remote(); state = app.render();
  assert.equal(state.teams[0].name, "Local draft");
  assert.equal(state.baseTeams, base);
  await state.actions.save();
  assert.equal(app.writes[0][1].expectedTeams, base);
});

test("unusable legacy team data opens a recoverable builder", () => {
  for (const value of ["not-json", "null", "{}", '[{"id":"bad","players":null}]']) {
    const app = setup(); app.malformed(value);
    const state = app.render();
    assert.equal(state.teams.length, 2);
    assert.equal(state.unselectedPlayers.length, 4);
  }
});

test("deletion preserves unrelated unsaved team edits without autosaving them", async () => {
  const app = setup();
  let state = app.render();
  state.updateTeamName("a", "My unsaved name"); state = app.render();
  app.remove(); state = app.render();
  assert.equal(state.teams[0].name, "My unsaved name");
  assert.deepEqual(state.teams[0].players.map(p => p.id), [11]);
  assert.equal(app.writes.length, 0);
  await state.actions.save();
  assert.equal(app.writes.length, 1);
  assert.equal(JSON.parse(app.writes[0][1].teams)[0].name, "My unsaved name");
});

test("an acknowledged save advances the base before a later deletion and draft save", async () => {
  const app = setup(); let state = app.render();
  state.updateTeamName("a", "Saved name"); state = app.render();
  await state.actions.save(); app.acknowledge(); state = app.render();
  assert.equal(state.baseTeams, app.saved());
  state.updateTeamName("b", "Later draft"); state = app.render();
  app.remove(); state = app.render();
  await state.actions.save();
  assert.equal(app.writes.at(-1)[1].expectedTeams, app.saved());
  assert.equal(JSON.parse(app.writes.at(-1)[1].teams)[1].name, "Later draft");
});
