import assert from "node:assert/strict";
import { test } from "node:test";
import { haveTeamsChanged } from "./have-teams-changed.ts";

const teams = [
  { id: "one", name: "Equipo 1", players: [1, 2] },
  { id: "two", name: "Equipo 2", players: [3] },
];
const saved = JSON.stringify(teams);

test("unchanged teams and surrounding name whitespace need no save", () => {
  assert.equal(haveTeamsChanged(saved, saved), false);
  assert.equal(haveTeamsChanged(JSON.stringify(teams.map(team => ({
    ...team, name: `  ${team.name}  `,
  }))), saved), false);
});

test("moving a player back restores the saved teams despite a different order", () => {
  const moved = [
    { ...teams[0], players: [1] },
    { ...teams[1], players: [3, 2] },
  ];
  assert.equal(haveTeamsChanged(JSON.stringify(moved), saved), true);
  const restored = [
    { ...teams[0], players: [2, 1] },
    { ...teams[1], players: [3] },
  ];
  const before = JSON.stringify(restored);
  assert.equal(haveTeamsChanged(before, saved), false);
  assert.equal(JSON.stringify(restored), before);
});

test("team name changes count and reverting them restores the saved state", () => {
  const renamed = JSON.stringify([{ ...teams[0], name: "Azules" }, teams[1]]);
  assert.equal(haveTeamsChanged(renamed, saved), true);
  assert.equal(haveTeamsChanged(saved, renamed), true);
  assert.equal(haveTeamsChanged(renamed, renamed), false);
});

test("a first valid lineup needs saving when there are no saved teams", () => {
  assert.equal(haveTeamsChanged(saved, "[]"), true);
  assert.equal(haveTeamsChanged(saved, "invalid legacy JSON"), true);
});
