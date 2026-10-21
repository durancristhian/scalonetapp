import { type Team } from "../types/team.ts";

export const IMAGE_EXPORT_PLAYER_ROLES = [
  { id: "captain", label: "Capitán" },
  { id: "goalkeeper", label: "Arquero" },
] as const;

export type ImageExportPlayerRole = (typeof IMAGE_EXPORT_PLAYER_ROLES)[number]["id"];
export type ImageExportTeamSelection = {
  playerIds: number[];
  assignments: Record<ImageExportPlayerRole, number | null>;
};
export type ImageExportTeamSelections = Record<string, ImageExportTeamSelection>;

const storageKey = (matchId: number) => `scaloneta:export-player-roles:v1:${matchId}`;

export function isImageExportTeamSelections(value: unknown): value is ImageExportTeamSelections {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((selection) => {
    if (!selection || typeof selection !== "object") return false;
    const { playerIds, assignments } = selection;
    return Array.isArray(playerIds) &&
      playerIds.every((id: unknown) => Number.isSafeInteger(id) && Number(id) > 0) &&
      new Set(playerIds).size === playerIds.length &&
      assignments && typeof assignments === "object" &&
      IMAGE_EXPORT_PLAYER_ROLES.every(({ id }) =>
        assignments[id] === null || (Number.isSafeInteger(assignments[id]) && assignments[id] > 0),
      );
  });
}

// Compare team membership, not order or names. A changed roster clears its
// assignments, even when the previously selected players are still present.
export function reconcileImageExportTeamSelections(
  teams: Team[],
  saved: ImageExportTeamSelections,
): ImageExportTeamSelections {
  const previouslyConfigured = Object.keys(saved).length > 0;
  return Object.fromEntries(teams.map((team) => {
    const playerIds = team.players.map(({ id }) => id).sort((a, b) => a - b);
    const previous = saved[team.id];
    const sameRoster = previous && playerIds.length === previous.playerIds.length &&
      playerIds.every((id, index) => id === previous.playerIds[index]);
    const assignments: ImageExportTeamSelection["assignments"] = { goalkeeper: null, captain: null };
    if (sameRoster) {
      for (const { id } of IMAGE_EXPORT_PLAYER_ROLES) {
        const selected = previous.assignments[id];
        assignments[id] = selected !== null && playerIds.includes(selected) ? selected : null;
      }
    } else if (!previouslyConfigured) {
      const goalkeepers = team.players.filter(({ position }) => position === "goa");
      if (goalkeepers.length === 1) assignments.goalkeeper = goalkeepers[0].id;
    }
    return [team.id, { playerIds, assignments }];
  }));
}

export function getImageExportPlayerRoles(
  selection: ImageExportTeamSelection,
  playerId: number,
): ImageExportPlayerRole[] {
  return IMAGE_EXPORT_PLAYER_ROLES
    .filter(({ id }) => selection.assignments[id] === playerId)
    .map(({ id }) => id);
}

function readSavedSelections(matchId: number): ImageExportTeamSelections | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey(matchId)) ?? "null");
    return isImageExportTeamSelections(value) ? value : null;
  } catch {
    return null;
  }
}

export function readImageExportTeamSelections(matchId: number, teams: Team[]): ImageExportTeamSelections {
  return reconcileImageExportTeamSelections(teams, readSavedSelections(matchId) ?? {});
}

// Observe changes while the editor is closed too. Do not initialize roles before
// the first export configuration, so unique-goalkeeper preselection still works.
export function invalidateImageExportTeamSelections(matchId: number, teams: Team[]): void {
  const saved = readSavedSelections(matchId);
  if (saved && Object.keys(saved).length) {
    storeImageExportTeamSelections(matchId, reconcileImageExportTeamSelections(teams, saved));
  }
}

export function storeImageExportTeamSelections(matchId: number, selections: ImageExportTeamSelections): void {
  try {
    localStorage.setItem(storageKey(matchId), JSON.stringify(selections));
  } catch {
    // Keep the current selection usable without browser persistence.
  }
}
