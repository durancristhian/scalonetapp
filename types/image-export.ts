import { type MatchWithPlayers } from "@/types/match";

export type ImageExportWindow = Window & {
  __SCALONETA_EXPORT_MATCH__?: MatchWithPlayers;
};
