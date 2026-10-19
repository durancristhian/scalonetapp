import { type MatchWithPlayers } from "@/types/match";

import { type ImageExportOptions } from "@/utils/image-export-options";

export type ImageExportWindow = Window & {
  __SCALONETA_EXPORT_OPTIONS__?: ImageExportOptions;
  __SCALONETA_EXPORT_MATCH__?: MatchWithPlayers;
};
