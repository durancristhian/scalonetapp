import { type MatchWithPlayers } from "@/types/match";

import { type ImageExportOptions } from "@/utils/image-export-options";
import { type ImageExportTeamSelections } from "@/utils/image-export-player-roles";

export type ImageExportWindow = Window & {
  __SCALONETA_EXPORT_OPTIONS__?: ImageExportOptions;
  __SCALONETA_EXPORT_MATCH__?: MatchWithPlayers;
  __SCALONETA_EXPORT_PLAYER_ROLES__?: ImageExportTeamSelections;
};
