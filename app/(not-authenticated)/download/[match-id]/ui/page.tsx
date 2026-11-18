"use client";

import { TeamExport } from "@/components/team-export/team-export";
import { type ImageExportWindow } from "@/types/image-export";
import { type BaseTeam } from "@/types/team";
import { DEFAULT_IMAGE_EXPORT_OPTIONS } from "@/utils/image-export-options";
import { useSyncExternalStore } from "react";

import { hydrateTeams } from "@/utils/hydrate-teams";

const subscribe = () => () => {};

function useExportGlobal<Key extends keyof ImageExportWindow>(key: Key) {
  return useSyncExternalStore(
    subscribe,
    () => (window as ImageExportWindow)[key],
    () => undefined,
  );
}

export default function Page() {
  const match = useExportGlobal("__SCALONETA_EXPORT_MATCH__");
  const options = useExportGlobal("__SCALONETA_EXPORT_OPTIONS__");
  const playerRoles = useExportGlobal("__SCALONETA_EXPORT_PLAYER_ROLES__");

  if (!match) return null;
  const savedTeams: BaseTeam[] = JSON.parse(match.teams);
  const teams = hydrateTeams(savedTeams, match.players);

  return (
    <TeamExport
      name={match.name}
      teams={teams}
      options={options ?? DEFAULT_IMAGE_EXPORT_OPTIONS}
      playerRoles={playerRoles ?? {}}
    />
  );
}
