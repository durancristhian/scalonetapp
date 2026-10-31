import type { BaseTeam } from "@/types/team";

// Recover the usable assignments. Unknown structures cannot be rendered safely.
export function readSavedTeams(serialized: string): BaseTeam[] {
  try {
    const value: unknown = JSON.parse(serialized);
    if (!Array.isArray(value)) return [];
    const ids = new Set<string>();
    const players = new Set<number>();
    return value.flatMap((team) => {
      if (
        !team ||
        typeof team !== "object" ||
        typeof team.id !== "string" ||
        !team.id.trim() ||
        ids.has(team.id) ||
        typeof team.name !== "string" ||
        !team.name.trim() ||
        !Array.isArray(team.players)
      )
        return [];
      ids.add(team.id);
      return [
        {
          ...team,
          players: team.players.filter((id: unknown): id is number => {
            if (!Number.isSafeInteger(id) || players.has(id as number))
              return false;
            players.add(id as number);
            return true;
          }),
        },
      ];
    });
  } catch {
    return [];
  }
}
