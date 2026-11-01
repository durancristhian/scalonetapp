"use client";

import { TeamExport } from "@/components/team-export/team-export";
import { type ImageExportWindow } from "@/types/image-export";
import { type MatchWithPlayers } from "@/types/match";
import { type BaseTeam, type Team } from "@/types/team";
import {
  DEFAULT_IMAGE_EXPORT_OPTIONS,
  type ImageExportOptions,
} from "@/utils/image-export-options";
import { useEffect, useState } from "react";
import { type ImageExportTeamSelections } from "@/utils/image-export-player-roles";

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
  const playersById = new Map(
    data.match.players.map((player) => [player.id, player]),
  );
  const savedTeams: BaseTeam[] = JSON.parse(data.match.teams);
  const teams: Team[] = savedTeams.map((team) => ({
    ...team,
    players: team.players.flatMap((id) => {
      const player = playersById.get(id);
      return player ? [player] : [];
    }),
  }));

  return (
    <TeamExport
      name={data.match.name}
      teams={teams}
      options={data.options}
      playerRoles={data.playerRoles}
    />
  );
}
