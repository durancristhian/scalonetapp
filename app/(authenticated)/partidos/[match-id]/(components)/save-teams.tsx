"use client";

import { PendingButton } from "@/components/pending-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    <PendingButton
      onClick={onSave}
      disabled={disabled}
      pending={processing}
      pendingLabel="Guardando..."
    >
      Guardar
    </PendingButton>
  </div>
);

export const TeamsValidationAlert = ({ message }: { message: string }) => (
  <Alert>
    <InfoIcon aria-hidden="true" />
    <AlertTitle>Revisá los equipos</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);
