"use client";

import { trackAnalytics } from "@/utils/analytics";
import { getExportAnalyticsData } from "@/utils/export-analytics";
import { useAlerts } from "@/components/use-alerts";
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
import { getSavedTeamsError } from "@/utils/team-validation";

const serializeTeams = (teams: Team[]): string =>
  getTeamsToSave(teams.map((team) => ({ ...team, name: team.name.trim() })));

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
  const payload = serializeTeams(teams);
  const hasUnsavedChanges = haveTeamsChanged(payload, savedComparison);

  const run = async (
    action: "save" | "export",
    options: ImageExportOptions = DEFAULT_IMAGE_EXPORT_OPTIONS,
    selections: ImageExportTeamSelections = {},
    draft?: Team[],
  ): Promise<string | null> => {
    const draftPayload = draft ? serializeTeams(draft) : payload;
    const draftError = draft
      ? getSavedTeamsError(
          draft.map((team) => ({
            ...team,
            players: team.players.map((player) => player.id),
          })),
          match.players.map((player) => player.id),
        )
      : null;
    if (draftError) {
      errorAlert({ title: draftError });
      return draftError;
    }
    if (operationLock.current || (!draft && !valid))
      return "No se pudo iniciar la operación. Intentá de nuevo.";
    if (action === "save" && !haveTeamsChanged(draftPayload, savedComparison)) {
      if (draft) successAlert({ title: "¡Equipos guardados con éxito!" });
      return null;
    }
    operationLock.current = true;
    setOperation(action);
    if (action === "export") trackAnalytics("export_requested");

    let stage: "save" | "image" = "save";
    try {
      if (draftPayload !== savedTeams) {
        unwrapActionResult(
          await editMatchAction(match.id, {
            teams: draftPayload,
            expectedTeams: savedTeams,
          }),
        );
        setSavedSnapshot({
          matchId: match.id,
          baseTeams,
          teams: draftPayload,
          comparisonTeams: draftPayload,
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
        downloadBlob(
          blob,
          blob.type === "image/jpeg" ? "equipos.jpg" : "equipos.png",
        );
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
    save: (draft?: Team[]) => run("save", undefined, undefined, draft),
    exportTeams: (
      options: ImageExportOptions,
      selections: ImageExportTeamSelections,
    ) => run("export", options, selections),
  };
};
