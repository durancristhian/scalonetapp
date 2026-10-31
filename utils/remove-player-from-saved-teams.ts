import { readSavedTeams } from "./read-saved-teams.ts";

// A roster deletion is persisted independently of any unsaved builder edits.
export function removePlayerFromSavedTeams(
  serialized: string,
  playerId: number,
): string {
  const teams = readSavedTeams(serialized);
  let changed = true;
  try {
    changed = JSON.stringify(JSON.parse(serialized)) !== JSON.stringify(teams);
  } catch {
    /* Repair unusable JSON. */
  }
  const nextTeams = teams.map((team) => {
    const players = team.players.filter((id) => id !== playerId);
    if (players.length === team.players.length) return team;
    changed = true;
    return { ...team, players };
  });
  return changed ? JSON.stringify(nextTeams) : serialized;
}
