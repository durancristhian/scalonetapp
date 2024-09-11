"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { editMatch } from "@/server/actions/match";
import { Team } from "@/types/team";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { FC, useState } from "react";

type SaveTeamsProps = {
  disabled: boolean;
  matchId: number;
  teams: Team[];
};

export const SaveTeams: FC<SaveTeamsProps> = ({ disabled, matchId, teams }) => {
  const { errorAlert, successAlert } = useAlerts();
  const [processing, setIsProcessing] = useState(false);

  const saveTeams = async () => {
    try {
      setIsProcessing(true);

      await editMatch(
        matchId,
        {
          teams: getTeamsToSave(teams),
        },
        "/partidos/[match-id]"
      );

      setIsProcessing(false);

      successAlert({
        title: "¡Equipos guardados con éxito!",
      });
    } catch (error) {
      console.error(error);

      setIsProcessing(false);

      errorAlert({
        title: "Ha ocurrido un error",
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Putting this empty div here so the tooltip works even if the button is disabled (it can't receive focus hence the tooltip won't be shown) */}
          <div>
            <Button onClick={saveTeams} disabled={disabled || processing}>
              {processing ? (
                <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
              ) : null}
              {processing ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </TooltipTrigger>
        {disabled && !processing ? (
          <TooltipContent>
            <p>No se cumple alguno de estos requisitos:</p>
            <ul className="list-disc list-inside">
              <li>Los nombres de los equipos no pueden estar vacíos.</li>
              <li>No puedes tener jugadores sin equipo.</li>
            </ul>
          </TooltipContent>
        ) : null}
      </Tooltip>
    </TooltipProvider>
  );
};
