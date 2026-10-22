import type { BaseTeam } from "@/types/team";

const comparisonKey = (serialized: string): string | null => {
  try {
    const value: unknown = JSON.parse(serialized);
    if (!Array.isArray(value)) return null;
    const teams: BaseTeam[] = [];
    for (const team of value) {
      if (!team || typeof team.id !== "string" || typeof team.name !== "string"
        || !Array.isArray(team.players) || !team.players.every(Number.isSafeInteger)) return null;
      // Preserve duplicate assignments and malformed records as pending repairs.
      teams.push({ id: team.id, name: team.name.trim(), players: [...team.players].sort((a, b) => a - b) });
    }
    return JSON.stringify(teams);
  } catch { return null; }
};

// Player order and surrounding name whitespace do not change the teams.
export const haveTeamsChanged = (current: string, saved: string): boolean => {
  const currentKey = comparisonKey(current);
  const savedKey = comparisonKey(saved);
  return currentKey === null || savedKey === null || currentKey !== savedKey;
};
