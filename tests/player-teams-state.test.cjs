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
    "@/server/actions/match": { editMatchAction: async (...args) => writes.push(args) },
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
    render: () => state.render(() => { const b = builder(match); return { ...b, actions: actions(match, b.teams, true) }; }),
    remove: () => { match = { ...match, players: match.players.slice(1), teams: JSON.stringify([{ id: "a", name: "A", players: [11] }, { id: "b", name: "B", players: [12, 13] }]) }; },
    saved: () => match.teams,
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
