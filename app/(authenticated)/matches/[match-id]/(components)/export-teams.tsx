"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { editMatch } from "@/server/actions/match";
import { Team } from "@/types/team";
import { BugIcon, LoaderCircleIcon, PartyPopperIcon } from "lucide-react";
import { FC, useState } from "react";
import { toast } from "sonner";

type ExportTeamsProps = {
  disabled: boolean;
  matchId: number;
  teams: Team[];
};

export const ExportTeams: FC<ExportTeamsProps> = ({
  disabled,
  matchId,
  teams,
}) => {
  const [processing, setIsProcessing] = useState(false);

  const exportTeams: () => Promise<void> = () => {
    return new Promise(async (resolve, reject) => {
      try {
        setIsProcessing(true);

        const formattedTeams = teams.map((team) => ({
          ...team,
          /* We only store the player ids */
          players: team.players.map((player) => player.id),
        }));

        await editMatch(
          matchId,
          {
            teams: JSON.stringify(formattedTeams),
          },
          "/matches/[match-id]"
        );

        toast(
          "Equipos guardados con éxito. En instantes comienza la descarga...",
          {
            icon: <PartyPopperIcon className="h-4 opacity-50 w-4" />,
          }
        );

        fetch(`/download/${matchId}`)
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(new Blob([blob]));

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "equipos.png");

            document.body.appendChild(link);

            link.click();

            window.URL.revokeObjectURL(url);

            setIsProcessing(false);

            resolve();
          });
      } catch (error) {
        console.error(error);

        toast("Ha ocurrido un error", {
          description:
            "No pudimos guardar los equipos. ¿Podrías volver a intentarlo?.",
          icon: <BugIcon className="h-4 opacity-50 w-4" />,
        });

        setIsProcessing(false);

        reject(error);
      }
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Putting this empty div here so the tooltip works even if the button is disabled (it can't receive focus hence the tooltip won't be shown) */}
          <div>
            <Button onClick={exportTeams} disabled={disabled || processing}>
              {processing ? (
                <LoaderCircleIcon className="animate-spin h-4 mr-2 opacity-50 w-4" />
              ) : null}
              {processing ? "Procesando..." : "Guardar y exportar"}
            </Button>
          </div>
        </TooltipTrigger>
        {disabled && !processing ? (
          <TooltipContent>
            <p>
              Cuando todos los jugadores estén en un equipo este botón va a
              estar habilitado.
            </p>
          </TooltipContent>
        ) : null}
      </Tooltip>
    </TooltipProvider>
  );
};
