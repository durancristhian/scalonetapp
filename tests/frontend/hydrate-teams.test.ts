import { describe, expect, it } from "vitest";
import { hydrateTeams } from "@/utils/hydrate-teams";
import { player } from "../fixtures";

describe("saved lineup hydration", () => {
  it("preserves saved order, empty teams and current player data while omitting missing and free players", () => {
    const roster = [player(1), player(2, { name: "Updated" }), player(3)];
    const saved = [
      { id: "a", name: "Azules", players: [2, 99, 1] },
      { id: "b", name: "Rojos", players: [] },
    ];
    expect(hydrateTeams(saved, roster)).toEqual([
      { id: "a", name: "Azules", players: [roster[1], roster[0]] },
      { id: "b", name: "Rojos", players: [] },
    ]);
    expect(saved[0].players).toEqual([2, 99, 1]);
    expect(roster.map(({ id }) => id)).toEqual([1, 2, 3]);
  });
});
