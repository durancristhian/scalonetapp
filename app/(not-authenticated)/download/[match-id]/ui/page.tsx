"use client";

import { TeamExport } from "@/components/team-export/team-export";
import { type ImageExportWindow } from "@/types/image-export";
import { type MatchWithPlayers } from "@/types/match";
import { type BaseTeam } from "@/types/team";
import {
  DEFAULT_IMAGE_EXPORT_OPTIONS,
  type ImageExportOptions,
} from "@/utils/image-export-options";
import { useEffect, useState } from "react";
import { type ImageExportTeamSelections } from "@/utils/image-export-player-roles";

import { hydrateTeams } from "@/utils/hydrate-teams";

export default function Page() {
  const [data, setData] = useState<{
    match: MatchWithPlayers;
    options: ImageExportOptions;
    playerRoles: ImageExportTeamSelections;
  }>();

  useEffect(() => {
    const source = window as ImageExportWindow;
    if (source.__SCALONETA_EXPORT_MATCH__) {
      setData({
        match: source.__SCALONETA_EXPORT_MATCH__,
        options:
          source.__SCALONETA_EXPORT_OPTIONS__ ?? DEFAULT_IMAGE_EXPORT_OPTIONS,
        playerRoles: source.__SCALONETA_EXPORT_PLAYER_ROLES__ ?? {},
      });
    }
  }, []);

  if (!data) return null;
  const savedTeams: BaseTeam[] = JSON.parse(data.match.teams);
  const teams = hydrateTeams(savedTeams, data.match.players);

  return (
    <TeamExport
      name={data.match.name}
      teams={teams}
      options={data.options}
      playerRoles={data.playerRoles}
    />
  );
}
