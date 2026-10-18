"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { editMatchAction } from "@/server/actions/match";
import { type MatchWithPlayers } from "@/types/match";
import { type Team } from "@/types/team";
import { downloadBlob } from "@/utils/download-blob";
import { fetchTeamExport } from "@/utils/fetch-team-export";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { useRef, useState } from "react";

export const useTeamActions = (
  match: MatchWithPlayers,
  teams: Team[],
  valid: boolean,
) => {
  const { errorAlert, successAlert } = useAlerts();
  const [operation, setOperation] = useState<"save" | "export" | null>(null);
  const operationLock = useRef(false);

  const run = async (action: "save" | "export") => {
    // Block a second click before React commits the disabled state.
    if (operationLock.current || !valid) return;
    operationLock.current = true;
    setOperation(action);

    try {
      const payload = getTeamsToSave(teams.map((team) => ({
        ...team,
        name: team.name.trim(),
      })));
      await editMatchAction(match.id, { teams: payload }, "/partidos/[match-id]");

      if (action === "export") {
        const blob = await fetchTeamExport(match.id);
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
