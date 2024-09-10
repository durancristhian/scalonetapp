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
import { FC } from "react";

type ConfirmTeamsUpdateProps = {
  onConfirm: () => void;
  showConfirmation: boolean;
  triggerText: string;
};

export const ConfirmTeamsUpdate: FC<ConfirmTeamsUpdateProps> = ({
  onConfirm,
  showConfirmation,
  triggerText,
}) => {
  if (!showConfirmation) {
    return (
      <Button onClick={onConfirm} variant="outline">
        {triggerText}
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">{triggerText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Confirmas el cambio de alineación?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Si confirmas, el estado actual de tus equipos se perderá como un
            tiro libre mal pateado. Asegúrate de estar listo para esta jugada
            antes de proceder.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onConfirm}>Sí, confirmo</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
