import { getTeamCountError } from "./team-count.ts";
import { MAX_PLAYERS_PER_MATCH } from "./player-limits.ts";
import { ERROR_MESSAGES } from "./error-messages.ts";

export const MAX_TEAM_NAME_LENGTH = 40;

// Validate assignment integrity, not completion. Empty teams and free players
// are valid in the builder, persistence, duplication and PNG export.
export function getSavedTeamsError(value: unknown, matchPlayerIds: readonly number[]): string | null {
  if (!Array.isArray(value)) return ERROR_MESSAGES.match_teams_invalid;
  const countError = getTeamCountError(value.length);
  if (countError) return countError;
  if (matchPlayerIds.length > MAX_PLAYERS_PER_MATCH) return `El partido admite hasta ${MAX_PLAYERS_PER_MATCH} jugadores. Eliminá los que sobran antes de guardar o exportar.`;
  const available = new Set(matchPlayerIds);
  const assigned = new Set<number>();
  const teamIds = new Set<string>();
  for (const team of value) {
    if (!team || typeof team.id !== "string" || !team.id.trim() || teamIds.has(team.id)) {
      return ERROR_MESSAGES.match_teams_invalid;
    }
    teamIds.add(team.id);
    if (typeof team.name !== "string" || !team.name.trim() || team.name.trim().length > MAX_TEAM_NAME_LENGTH) {
      return "Los nombres de los equipos deben tener entre 1 y 40 caracteres.";
    }
    if (!Array.isArray(team.players)) return ERROR_MESSAGES.match_teams_invalid;
    for (const id of team.players) {
      if (!Number.isSafeInteger(id) || !available.has(id)) return "Hay jugadores que ya no pertenecen al partido. Volvé a armar los equipos.";
      if (assigned.has(id)) return "Un jugador no puede estar repetido ni pertenecer a los dos equipos.";
      assigned.add(id);
    }
  }
  return null;
}
