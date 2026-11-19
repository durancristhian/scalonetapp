"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { type FC } from "react";

type ConfirmTeamsUpdateProps = {
  disabled: boolean;
  onSave: () => void;
  showConfirmation: boolean;
};

export const ConfirmTeamsUpdate: FC<ConfirmTeamsUpdateProps> = ({
  disabled,
  onSave,
  showConfirmation,
}) => {
  if (!showConfirmation) {
    return (
      <Button onClick={onSave} disabled={disabled}>
        Guardar
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={disabled}>Guardar</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Confirmás el cambio de alineaciones?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Si confirmás, el estado actual de tus equipos se perderá como un
            penal pateado por el Puma Gigliotti. Asegurate de estar listo para
            esta jugada antes de proceder.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onSave}>Sí, confirmo</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
