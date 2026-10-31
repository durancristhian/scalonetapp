import type { Player } from "@prisma/client";
import type { MatchWithPlayers } from "@/types/match";
import type { Team } from "@/types/team";

export function player(id: number, overrides: Partial<Player> = {}): Player {
  return {
    id,
    matchId: 1,
    name: `Jugador ${id}`,
    level: 5,
    position: "mid",
    avatar: "",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}
export function teams(first: Player[] = [], second: Player[] = []): Team[] {
  return [
    { id: "a", name: "Azules", players: first },
    { id: "b", name: "Rojos", players: second },
  ];
}
export function match(
  players: Player[] = [],
  savedTeams = "[]",
): MatchWithPlayers {
  return {
    id: 1,
    name: "Amistoso",
    userId: "owner",
    players,
    teams: savedTeams,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };
}
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
