import {
  IMAGE_EXPORT_WIDTH,
  type ImageExportOptions,
} from "@/utils/image-export-options";
import type { Team } from "@/types/team";

// Shared measurements for the illustration and the flat roster placed over it.
// Typography, colors and borders belong to each part's stylesheet.
export const EXPORT_LAYOUT = {
  width: IMAGE_EXPORT_WIDTH,
  standHeight: 64,
  teamInset: 56,
  columnGap: 32,
  fieldInset: 32,
  avatarCellHeight: 176,
  textCellHeight: 68,
  rowGap: 24,
  minFieldHeight: 736,
  minTextFieldHeight: 384,
} as const;

export function getExportLayout(teams: Team[], options: ImageExportOptions) {
  const showAvatars = options.avatarShape !== "none";
  const rows = Math.max(
    1,
    ...teams.map((team) => Math.ceil(team.players.length / 2)),
  );
  const cellHeight = showAvatars
    ? EXPORT_LAYOUT.avatarCellHeight
    : EXPORT_LAYOUT.textCellHeight;
  const fieldHeight = Math.max(
    showAvatars
      ? EXPORT_LAYOUT.minFieldHeight
      : EXPORT_LAYOUT.minTextFieldHeight,
    rows * cellHeight +
      (rows - 1) * EXPORT_LAYOUT.rowGap +
      2 * EXPORT_LAYOUT.fieldInset,
  );
  return {
    ...EXPORT_LAYOUT,
    rows,
    cellHeight,
    fieldHeight,
    sceneHeight: fieldHeight + EXPORT_LAYOUT.standHeight,
  };
}

export type ExportLayout = ReturnType<typeof getExportLayout>;
