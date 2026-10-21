import test from 'node:test';
import assert from 'node:assert/strict';
import {
  reconcileImageExportTeamSelections as reconcile,
  getImageExportPlayerRoles,
  readImageExportTeamSelections,
  storeImageExportTeamSelections,
} from './image-export-player-roles.ts';
import { DEFAULT_IMAGE_EXPORT_OPTIONS } from './image-export-options.ts';
import { imageExportRequestSearchParams, parseImageExportRequest } from './image-export-request.ts';

const player = (id, position = 'mid') => ({ id, position, name: `Jugador ${id}` });
const teams = [
  { id: 'a', name: 'Norte', players: [player(1, 'goa'), player(2), player(3)] },
  { id: 'b', name: 'Sur', players: [player(4, 'goa'), player(5), player(6)] },
];
const assignments = (selections) => Object.values(selections).map(x => x.assignments.goalkeeper);

test('preselects only a unique goalkeeper on the first opening; explicit none persists', () => {
  const initial = reconcile(teams, {});
  assert.deepEqual(assignments(initial), [1, 4]);
  initial.a.assignments.goalkeeper = null;
  assert.deepEqual(assignments(reconcile(teams, initial)), [null, 4]);
  const multiple = [{ ...teams[0], players: [player(1, 'goa'), player(2, 'goa')] }];
  assert.deepEqual(assignments(reconcile(multiple, {})), [null]);
});

test('keeper swaps, other-player swaps and two keepers in one team clear assignments', () => {
  const saved = reconcile(teams, {});
  const scenarios = [
    [[player(4, 'goa'), player(2), player(3)], [player(1, 'goa'), player(5), player(6)]],
    [[player(1, 'goa'), player(5), player(3)], [player(4, 'goa'), player(2), player(6)]],
    [[player(1, 'goa'), player(4, 'goa'), player(3)], [player(2), player(5), player(6)]],
  ];
  for (const [a, b] of scenarios) {
    const changed = [{ ...teams[0], players: a }, { ...teams[1], players: b }];
    assert.deepEqual(assignments(reconcile(changed, saved)), [null, null]);
  }
  const newIds = teams.map(t => ({ ...t, id: `new-${t.id}` }));
  assert.deepEqual(assignments(reconcile(newIds, saved)), [null, null]);
});

test('renaming and reordering keep assignments; a changed roster clears only its team', () => {
  const saved = reconcile(teams, {});
  const reordered = teams.map(t => ({ ...t, name: 'Otro nombre', players: [...t.players].reverse() }));
  assert.deepEqual(assignments(reconcile(reordered, saved)), [1, 4]);
  assert.deepEqual(assignments(reconcile([{ ...teams[0], players: [...teams[0].players, player(7)] }, teams[1]], saved)), [null, 4]);
});

test('browser persistence is isolated by match and stale choices stay cleared after reopening', () => {
  const previous = globalThis.localStorage;
  const memory = new Map();
  globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  try {
    const saved = reconcile(teams, {});
    saved.a.assignments.goalkeeper = 2;
    saved.a.assignments.captain = 2;
    storeImageExportTeamSelections(10, saved);
    assert.equal(readImageExportTeamSelections(10, teams).a.assignments.goalkeeper, 2);
    assert.equal(readImageExportTeamSelections(10, teams).a.assignments.captain, 2);
    assert.equal(readImageExportTeamSelections(11, teams).a.assignments.goalkeeper, 1);
    const changed = [{ ...teams[0], players: [player(1, 'goa'), player(2), player(7)] }, teams[1]];
    const cleared = readImageExportTeamSelections(10, changed);
    assert.equal(cleared.a.assignments.goalkeeper, null);
    storeImageExportTeamSelections(10, cleared);
    assert.deepEqual(readImageExportTeamSelections(10, changed).a.assignments, { goalkeeper: null, captain: null });
  } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
});

test('download query preserves assignments and rejects malformed role payloads', () => {
  const selections = reconcile(teams, {});
  selections.a.assignments.captain = 1;
  selections.b.assignments.captain = 5;
  const query = imageExportRequestSearchParams(DEFAULT_IMAGE_EXPORT_OPTIONS, selections);
  assert.deepEqual(parseImageExportRequest(query), { options: DEFAULT_IMAGE_EXPORT_OPTIONS, selections });
  query.append('roles', '{}');
  assert.equal(parseImageExportRequest(query), null);
  assert.equal(parseImageExportRequest(new URLSearchParams('roles={broken')), null);
  assert.equal(parseImageExportRequest(new URLSearchParams('roles={"a":{"playerIds":[1],"assignments":{"goalkeeper":"1"}}}')), null);
  const forged = { ...selections, a: { ...selections.a, assignments: { goalkeeper: 4, captain: 4 } } };
  assert.equal(reconcile(teams, forged).a.assignments.goalkeeper, null);
});


test('captains start unassigned and can share the goalkeeper role', () => {
  const saved = reconcile(teams, {});
  assert.equal(saved.a.assignments.captain, null);
  assert.equal(saved.b.assignments.captain, null);
  saved.a.assignments.captain = 1;
  saved.b.assignments.captain = 5;
  assert.deepEqual(getImageExportPlayerRoles(saved.a, 1), ['captain', 'goalkeeper']);
  const reordered = teams.map(t => ({ ...t, name: 'Renombrado', players: [...t.players].reverse() }));
  assert.deepEqual(reconcile(reordered, saved), saved);
  const changed = [{ ...teams[0], players: [player(1, 'goa'), player(2), player(7)] }, teams[1]];
  const reconciled = reconcile(changed, saved);
  assert.deepEqual(reconciled.a.assignments, { goalkeeper: null, captain: null });
  assert.deepEqual(reconciled.b.assignments, { goalkeeper: 4, captain: 5 });
});

test('deleting a selected captain clears both roles only in the changed team', () => {
  const saved = reconcile(teams, {});
  saved.a.assignments.captain = 2;
  saved.b.assignments.captain = 5;
  const changed = [{...teams[0],players:teams[0].players.filter(p=>p.id!==2)},teams[1]];
  const next = reconcile(changed,saved);
  assert.deepEqual(next.a.assignments,{goalkeeper:null,captain:null});
  assert.deepEqual(next.b,saved.b);
});

test('removed teams disappear and newly created teams do not silently regain roles', () => {
  const saved = reconcile(teams, {});
  saved.a.assignments.captain = 1;
  const replacement = {...teams[1],id:'replacement'};
  const next = reconcile([teams[0],replacement],saved);
  assert.equal(next.b,undefined);
  assert.deepEqual(next.a,saved.a);
  assert.deepEqual(next.replacement.assignments,{goalkeeper:null,captain:null});
});
