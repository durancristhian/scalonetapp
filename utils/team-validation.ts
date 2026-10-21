import { getTeamCountError } from "./team-count.ts";

export const MAX_TEAM_NAME_LENGTH = 40;

// Shared by the builder, persistence and the PNG endpoint, including legacy data.
export function getSavedTeamsError(value: unknown, matchPlayerIds: readonly number[]): string | null {
  if (!Array.isArray(value)) return "La información de los equipos no es válida. Volvé a armar los equipos.";
  const countError = getTeamCountError(value.length);
  if (countError) return countError;
  const available = new Set(matchPlayerIds);
  const assigned = new Set<number>();
  const teamIds = new Set<string>();
  for (const team of value) {
    if (!team || typeof team.id !== "string" || !team.id.trim() || teamIds.has(team.id)) {
      return "La información de los equipos no es válida. Volvé a armar los equipos.";
    }
    teamIds.add(team.id);
    if (typeof team.name !== "string" || !team.name.trim() || team.name.trim().length > MAX_TEAM_NAME_LENGTH) {
      return "Los nombres de los equipos deben tener entre 1 y 40 caracteres.";
    }
    if (!Array.isArray(team.players) || !team.players.length) return "Cada equipo necesita al menos un jugador.";
    for (const id of team.players) {
      if (!Number.isSafeInteger(id) || !available.has(id)) return "Hay jugadores que ya no pertenecen al partido. Volvé a armar los equipos.";
      if (assigned.has(id)) return "Un jugador no puede estar repetido ni pertenecer a los dos equipos.";
      assigned.add(id);
    }
  }
  return assigned.size === available.size ? null : "Asigná a todos los jugadores antes de guardar o exportar los equipos.";
}
