"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteMatch } from "@/server/actions/match";
import { FC } from "react";

type DeleteMatchProps = {
  id: number;
  onClose: () => void;
};

export const DeleteMatch: FC<DeleteMatchProps> = ({ id, onClose }) => {
  const { errorAlert, successAlert } = useAlerts();

  const onDeleteMatch: () => Promise<void> = async () => {
    try {
      await deleteMatch(id);

      successAlert({ title: "¡Partido eliminado!" });

      onClose();
    } catch (error) {
      console.error(error);

      errorAlert({
        title: "Error en la eliminación del partido",
        description: "¿Podrías volver a intentarlo?.",
      });
    }
  };

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este partido?</AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar este partido eliminará toda la información asociada a él.
            Revisa tu decisión antes de proceder, ya que esta acción no tiene
            vuelta atrás.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onDeleteMatch}>Eliminar</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
