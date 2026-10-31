import type { Team } from "../types/team.ts";
import type { ExportAnalyticsData } from "./analytics-events.ts";
import type { ImageExportOptions } from "./image-export-options.ts";
import {
  reconcileImageExportTeamSelections,
  type ImageExportTeamSelections,
} from "./image-export-player-roles.ts";

export function getExportAnalyticsData(
  options: ImageExportOptions,
  teams: Team[],
  selections: ImageExportTeamSelections,
): ExportAnalyticsData {
  const resolved = Object.values(
    reconcileImageExportTeamSelections(teams, selections),
  );
  return {
    surface: options.background,
    weather: options.weather,
    image_shape: options.avatarShape,
    alignment: options.alignment,
    has_captain: resolved.some(
      (selection) => selection.assignments.captain !== null,
    ),
    has_goalkeeper: resolved.some(
      (selection) => selection.assignments.goalkeeper !== null,
    ),
  };
}
