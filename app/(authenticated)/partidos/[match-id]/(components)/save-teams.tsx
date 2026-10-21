"use client";

import { SoccerBall } from "@/components/soccer-ball";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";
import { type FC } from "react";

type SaveTeamsProps = {
  disabled: boolean;
  processing: boolean;
  onSave: () => void;
};

export const SaveTeams: FC<SaveTeamsProps> = ({
  disabled,
  processing,
  onSave,
}) => (
  <div className="inline-flex gap-2">
    <Button onClick={onSave} disabled={disabled}>
      {processing ? (
        <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
      ) : null}
      {processing ? "Guardando..." : "Guardar"}
    </Button>
  </div>
);

export const TeamsValidationAlert = () => (
  <Alert>
    <InfoIcon aria-hidden="true" />
    <AlertTitle>No se cumple alguno de estos requisitos:</AlertTitle>
    <AlertDescription>
      <ul className="list-disc list-inside">
        <li>El partido debe tener dos equipos, con al menos un jugador en cada uno.</li>
        <li>Los nombres de los equipos no pueden estar vacíos.</li>
        <li>No puedes tener jugadores sin equipo.</li>
      </ul>
    </AlertDescription>
  </Alert>
);
