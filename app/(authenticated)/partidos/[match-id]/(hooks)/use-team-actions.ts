"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { editMatchAction } from "@/server/actions/match";
import { type MatchWithPlayers } from "@/types/match";
import { type Team } from "@/types/team";
import { downloadBlob } from "@/utils/download-blob";
import { fetchTeamExport } from "@/utils/fetch-team-export";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { getTeamExportSnapshot } from "@/utils/team-export-snapshot";
import { useEffect, useRef, useState, type RefObject } from "react";

export const useTeamActions = (
  match: MatchWithPlayers,
  teams: Team[],
  valid: boolean,
  operationLock: RefObject<boolean>,
) => {
  const { errorAlert, successAlert } = useAlerts();
  const [operation, setOperation] = useState<"save" | "export" | null>(null);
  const savedTeams = useRef(match.teams);

  useEffect(() => {
    savedTeams.current = match.teams;
  }, [match.id, match.teams]);

  const run = async (action: "save" | "export") => {
    // The ref blocks a second click before React has committed the disabled state.
    if (operationLock.current || !valid) return;
    operationLock.current = true;
    setOperation(action);
    const payload = getTeamsToSave(teams);
    const snapshot = getTeamExportSnapshot({ ...match, teams: payload });

    try {
      if (action === "save" || savedTeams.current !== payload) {
        await editMatchAction(match.id, { teams: payload }, "/partidos/[match-id]");
        savedTeams.current = payload;
      }

      if (action === "export") {
        const blob = await fetchTeamExport(match.id, snapshot);
        downloadBlob(blob, "equipos.png");
      }

      successAlert({ title: action === "export" ? "¡Descarga iniciada!" : "¡Equipos guardados con éxito!" });
    } catch {
      errorAlert({ title: action === "export" ? "No se pudo exportar. Intentá de nuevo." : "No se pudieron guardar los equipos. Intentá de nuevo." });
    } finally {
      operationLock.current = false;
      setOperation(null);
    }
  };

  return { operation, save: () => run("save"), exportTeams: () => run("export") };
};
