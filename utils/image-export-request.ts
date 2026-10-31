import {
  imageExportSearchParams,
  parseImageExportOptions,
  type ImageExportOptions,
} from "./image-export-options.ts";
import {
  isImageExportTeamSelections,
  type ImageExportTeamSelections,
} from "./image-export-player-roles.ts";

export function imageExportRequestSearchParams(
  options: ImageExportOptions,
  selections: ImageExportTeamSelections,
): URLSearchParams {
  const params = imageExportSearchParams(options);
  if (Object.keys(selections).length)
    params.set("roles", JSON.stringify(selections));
  return params;
}

export function parseImageExportRequest(params: URLSearchParams): {
  options: ImageExportOptions;
  selections: ImageExportTeamSelections;
} | null {
  const roles = params.getAll("roles");
  if (roles.length > 1) return null;
  const preferences = new URLSearchParams(params);
  preferences.delete("roles");
  const options = parseImageExportOptions(preferences);
  if (!options) return null;
  try {
    const selections: unknown = roles.length ? JSON.parse(roles[0]) : {};
    return isImageExportTeamSelections(selections)
      ? { options, selections }
      : null;
  } catch {
    return null;
  }
}
