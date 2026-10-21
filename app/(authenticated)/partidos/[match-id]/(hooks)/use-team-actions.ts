"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { editMatchAction } from "@/server/actions/match";
import { type MatchWithPlayers } from "@/types/match";
import { type Team } from "@/types/team";
import { downloadBlob } from "@/utils/download-blob";
import { fetchTeamExport } from "@/utils/fetch-team-export";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import {
  DEFAULT_IMAGE_EXPORT_OPTIONS,
  type ImageExportOptions,
} from "@/utils/image-export-options";
import { useEffect, useRef, useState } from "react";
import { type ImageExportTeamSelections } from "@/utils/image-export-player-roles";

export const useTeamActions = (
  match: MatchWithPlayers,
  teams: Team[],
  valid: boolean,
) => {
  const { errorAlert, successAlert } = useAlerts();
  const [operation, setOperation] = useState<"save" | "export" | null>(null);
  const operationLock = useRef(false);
  const savedTeams = useRef(match.teams);
  useEffect(() => {
    savedTeams.current = match.teams;
  }, [match.id, match.teams]);

  const run = async (
    action: "save" | "export",
    options: ImageExportOptions = DEFAULT_IMAGE_EXPORT_OPTIONS,
    selections: ImageExportTeamSelections = {},
  ): Promise<string | null> => {
    // Block a second click before React commits the disabled state.
    if (operationLock.current || !valid)
      return "No se pudo iniciar la operación. Intentá de nuevo.";
    operationLock.current = true;
    setOperation(action);

    let stage: "save" | "image" = "save";
    try {
      const payload = getTeamsToSave(
        teams.map((team) => ({
          ...team,
          name: team.name.trim(),
        })),
      );
      if (payload !== savedTeams.current) {
        await editMatchAction(
          match.id,
          { teams: payload },
          "/partidos/[match-id]",
        );
        savedTeams.current = payload;
      }

      if (action === "export") {
        stage = "image";
        const blob = await fetchTeamExport(match.id, options, selections);
        downloadBlob(blob, "equipos.png");
      }

      if (action === "save")
        successAlert({ title: "¡Equipos guardados con éxito!" });
      return null;
    } catch {
      const message =
        stage === "image"
          ? "Los equipos están guardados, pero no se pudo descargar la imagen. Intentá de nuevo."
          : "No se pudieron guardar los equipos. Intentá de nuevo.";
      if (action === "save") errorAlert({ title: message });
      return message;
    } finally {
      operationLock.current = false;
      setOperation(null);
    }
  };

  return {
    operation,
    save: () => run("save"),
    exportTeams: (options: ImageExportOptions, selections: ImageExportTeamSelections) => run("export", options, selections),
  };
};
