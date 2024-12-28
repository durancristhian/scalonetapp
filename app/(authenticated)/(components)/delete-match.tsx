"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { SoccerBall } from "@/components/soccer-ball";
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
import { deleteMatchAction } from "@/server/actions/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { type FC, useState } from "react";

type DeleteMatchProps = {
  id: number;
  onClose: () => void;
};

export const DeleteMatch: FC<DeleteMatchProps> = ({ id, onClose }) => {
  const [processing, setIsProcessing] = useState(false);
  const { errorAlert, successAlert } = useAlerts();

  const onDeleteMatch: () => Promise<void> = async () => {
    try {
      setIsProcessing(true);

      await deleteMatchAction(id);

      setIsProcessing(false);

      successAlert({
        title: "¡Partido eliminado!",
      });

      onClose();
    } catch (error) {
      if (error instanceof Error) {
        errorAlert({
          title: error.message || ERROR_MESSAGES.match_delete_error,
        });
      }

      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open>
      <AlertDialogContent onEscapeKeyDown={onClose}>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este partido?</AlertDialogTitle>
          <AlertDialogDescription className="max-md:text-balance">
            Ten en cuenta que se eliminará toda su información asociada. Esta
            acción no tiene vuelta atrás.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onDeleteMatch} disabled={processing}>
              {processing ? (
                <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
              ) : null}
              {processing ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
