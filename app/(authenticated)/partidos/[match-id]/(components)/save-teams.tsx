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

export const TeamsValidationAlert = ({ message }: { message: string }) => (
  <Alert>
    <InfoIcon aria-hidden="true" />
    <AlertTitle>Revisá los equipos</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);
