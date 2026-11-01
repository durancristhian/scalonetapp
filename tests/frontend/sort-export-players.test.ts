import { describe, expect, it } from "vitest";
import { sortExportPlayers } from "@/utils/sort-export-players";
import { byName } from "@/utils/by-name";
import { player } from "../fixtures";

const roster = [
  player(1, { name: "Ana", position: "for" }),
  player(2, { name: "Zoe", position: "goa" }),
  player(3, { name: "Eva", position: "mid" }),
  player(4, { name: "Diego", position: "def" }),
  player(5, { name: "Beto", position: "goa" }),
  player(6, { name: "Caro", position: "def" }),
  player(7, { name: "Fede", position: "mid" }),
  player(8, { name: "Gabi", position: "for" }),
];

describe("export player order", () => {
  it("preserves the existing alphabetical comparison regardless of position", () => {
    const players = [
      ...roster,
      player(9, { name: "Álvaro" }),
      player(10, { name: "ana" }),
    ];
    expect(sortExportPlayers(players, "alphabetical")).toEqual(
      [...players].sort(byName),
    );
  });

  it("orders goalkeeper, defender, midfielder and forward alphabetically within each position", () => {
    expect(
      sortExportPlayers(roster, "position").map(({ name }) => name),
    ).toEqual(["Beto", "Zoe", "Caro", "Diego", "Eva", "Fede", "Ana", "Gabi"]);
  });

  it.each(["alphabetical", "position"] as const)(
    "does not mutate the lineup when sorting by %s",
    (order) => {
      const players = Object.freeze([...roster]);
      expect(sortExportPlayers(players, order)).not.toBe(players);
      expect(players).toEqual(roster);
      expect(sortExportPlayers([], order)).toEqual([]);
      expect(sortExportPlayers([roster[0]], order)).toEqual([roster[0]]);
    },
  );

  it("preserves players with duplicate names", () => {
    const players = [
      player(1, { name: "Alex", position: "def" }),
      player(2, { name: "Alex", position: "def" }),
    ];
    expect(sortExportPlayers(players, "position")).toEqual(players);
  });
});
