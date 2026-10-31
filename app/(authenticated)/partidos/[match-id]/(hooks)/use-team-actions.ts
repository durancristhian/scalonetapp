"use client";

import { trackAnalytics } from "@/utils/analytics";
import { getExportAnalyticsData } from "@/utils/export-analytics";
import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { editMatchAction } from "@/server/actions/match";
import { type MatchWithPlayers } from "@/types/match";
import { type Team } from "@/types/team";
import { downloadBlob } from "@/utils/download-blob";
import { fetchTeamExport } from "@/utils/fetch-team-export";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { haveTeamsChanged } from "@/utils/have-teams-changed";
import {
  DEFAULT_IMAGE_EXPORT_OPTIONS,
  type ImageExportOptions,
} from "@/utils/image-export-options";
import { useRef, useState } from "react";
import { type ImageExportTeamSelections } from "@/utils/image-export-player-roles";
import {
  unwrapActionResult,
  getActionErrorMessage,
} from "@/utils/action-result";
import { lineupFingerprint } from "@/utils/lineup-fingerprint";

export const useTeamActions = (
  match: MatchWithPlayers,
  teams: Team[],
  valid: boolean,
  baseTeams: string,
  comparisonTeams: string = baseTeams,
) => {
  const { errorAlert, successAlert } = useAlerts();
  const [operation, setOperation] = useState<"save" | "export" | null>(null);
  const operationLock = useRef(false);
  // A successful save is the baseline even before server props refresh.
  const [savedSnapshot, setSavedSnapshot] = useState({
    matchId: match.id,
    baseTeams,
    teams: baseTeams,
    comparisonTeams,
  });
  const baseChanged =
    savedSnapshot.matchId !== match.id || savedSnapshot.baseTeams !== baseTeams;
  const savedTeams = baseChanged ? baseTeams : savedSnapshot.teams;
  const savedComparison = baseChanged
    ? comparisonTeams
    : savedSnapshot.comparisonTeams;
  if (baseChanged) {
    setSavedSnapshot({
      matchId: match.id,
      baseTeams,
      teams: baseTeams,
      comparisonTeams,
    });
  }
  const payload = getTeamsToSave(
    teams.map((team) => ({ ...team, name: team.name.trim() })),
  );
  const hasUnsavedChanges = haveTeamsChanged(payload, savedComparison);

  const run = async (
    action: "save" | "export",
    options: ImageExportOptions = DEFAULT_IMAGE_EXPORT_OPTIONS,
    selections: ImageExportTeamSelections = {},
  ): Promise<string | null> => {
    // Block a second click before React commits the disabled state.
    if (operationLock.current || !valid)
      return "No se pudo iniciar la operación. Intentá de nuevo.";
    if (action === "save" && !hasUnsavedChanges) return null;
    operationLock.current = true;
    setOperation(action);
    if (action === "export") trackAnalytics("export_requested");

    let stage: "save" | "image" = "save";
    try {
      // Export also syncs ordering so its preview fingerprint matches the server.
      if (payload !== savedTeams) {
        unwrapActionResult(
          await editMatchAction(
            match.id,
            { teams: payload, expectedTeams: savedTeams },
            "/partidos/[match-id]",
          ),
        );
        setSavedSnapshot({
          matchId: match.id,
          baseTeams,
          teams: payload,
          comparisonTeams: payload,
        });
        trackAnalytics("teams_saved");
      }

      if (action === "export") {
        stage = "image";
        const fingerprint = await lineupFingerprint(match.name, teams);
        const blob = await fetchTeamExport(
          match.id,
          options,
          selections,
          fingerprint,
        );
        downloadBlob(blob, "equipos.png");
        trackAnalytics(
          "export_download_started",
          getExportAnalyticsData(options, teams, selections),
        );
      }

      if (action === "save")
        successAlert({ title: "¡Equipos guardados con éxito!" });
      return null;
    } catch (error) {
      if (action === "export") {
        trackAnalytics(
          stage === "image" ? "export_image_failed" : "export_save_failed",
        );
      }
      const message = getActionErrorMessage(
        error,
        stage === "image"
          ? "Los equipos están guardados, pero no se pudo descargar la imagen. Intentá de nuevo."
          : "No se pudieron guardar los equipos. Intentá de nuevo.",
      );
      if (action === "save") errorAlert({ title: message });
      return message;
    } finally {
      operationLock.current = false;
      setOperation(null);
    }
  };

  return {
    hasUnsavedChanges,
    operation,
    save: () => run("save"),
    exportTeams: (
      options: ImageExportOptions,
      selections: ImageExportTeamSelections,
    ) => run("export", options, selections),
  };
};
