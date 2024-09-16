"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { SoccerBall } from "@/components/soccer-ball";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { editMatchAction } from "@/server/actions/match";
import { Team } from "@/types/team";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { InfoIcon } from "lucide-react";
import { FC, useState } from "react";

type SaveTeamsProps = {
  disabled?: boolean;
  matchId: number;
  teams: Team[];
};

export const SaveTeams: FC<SaveTeamsProps> = ({ disabled, matchId, teams }) => {
  if (disabled) {
    return <DisabledContent />;
  }

  return <EnabledContent matchId={matchId} teams={teams} />;
};

const DisabledContent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="inline-flex space-x-2">
        <Button disabled>Guardar</Button>
        <Button
          onClick={() => {
            setDialogOpen(true);
          }}
          variant="ghost"
          size="icon"
        >
          <InfoIcon className="h-4 text-destructive w-4" />
        </Button>
      </div>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              No se cumple alguno de estos requisitos:
            </AlertDialogTitle>
            <AlertDialogDescription>
              <ul className="list-disc list-inside">
                <li>Los nombres de los equipos no pueden estar vacíos.</li>
                <li>No puedes tener jugadores sin equipo.</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

type EnabledContentProps = Pick<SaveTeamsProps, "matchId" | "teams">;

export const EnabledContent: FC<EnabledContentProps> = ({ matchId, teams }) => {
  const { errorAlert, successAlert } = useAlerts();
  const [processing, setIsProcessing] = useState(false);

  const saveTeams = async () => {
    try {
      setIsProcessing(true);

      await editMatchAction(
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
    <Button onClick={saveTeams} disabled={processing}>
      {processing ? (
        <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
      ) : null}
      {processing ? "Guardando..." : "Guardar"}
    </Button>
  );
};
