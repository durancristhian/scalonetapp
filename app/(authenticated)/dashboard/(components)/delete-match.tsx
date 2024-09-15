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

      onClose();

      successAlert({
        title: "¡Partido eliminado!",
      });
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
          <AlertDialogDescription className="max-md:text-balance">
            Ten en cuenta que se eliminará toda la información asociada a él.
            Esta acción no tiene vuelta atrás.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onDeleteMatch}>Sí, eliminar</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
