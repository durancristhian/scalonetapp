import { readSavedTeams } from "./read-saved-teams.ts";

const comparisonKey = (serialized: string): string =>
  JSON.stringify(readSavedTeams(serialized).map(team => ({
    id: team.id,
    name: team.name.trim(),
    players: [...team.players].sort((a, b) => a - b),
  })));

// Player order and surrounding name whitespace do not change the teams.
export const haveTeamsChanged = (current: string, saved: string): boolean =>
  comparisonKey(current) !== comparisonKey(saved);
