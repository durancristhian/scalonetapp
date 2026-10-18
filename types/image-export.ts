import { type MatchWithPlayers } from "@/types/match";

import { type ImageExportStyle } from "@/utils/image-export-style";

export type ImageExportWindow = Window & {
  __SCALONETA_EXPORT_STYLE__?: ImageExportStyle;
  __SCALONETA_EXPORT_MATCH__?: MatchWithPlayers;
};
