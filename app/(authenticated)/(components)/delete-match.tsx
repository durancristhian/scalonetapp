"use client";

import {
  unwrapActionResult,
  getActionErrorMessage,
} from "@/utils/action-result";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { SoccerBall } from "@/components/soccer-ball";
import {
  AlertDialog,
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
import { type FC, useRef, useState } from "react";

type DeleteMatchProps = {
  id: number;
  onClose: () => void;
};

export const DeleteMatch: FC<DeleteMatchProps> = ({ id, onClose }) => {
  const [processing, setIsProcessing] = useState(false);
  const lock = useRef(false);
  const { errorAlert, successAlert } = useAlerts();

  const onDeleteMatch: () => Promise<void> = async () => {
    if (lock.current) return;
    lock.current = true;
    try {
      setIsProcessing(true);

      unwrapActionResult(await deleteMatchAction(id));

      lock.current = false;
      setIsProcessing(false);

      successAlert({
        title: "¡Partido eliminado!",
      });

      onClose();
    } catch (error) {
      if (error instanceof Error) {
        errorAlert({
          title: getActionErrorMessage(
            error,
            ERROR_MESSAGES.match_delete_error,
          ),
        });
      }

      lock.current = false;
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open>
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (lock.current) event.preventDefault();
          else onClose();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este partido?</AlertDialogTitle>
          <AlertDialogDescription className="max-md:text-balance">
            Ten en cuenta que se eliminará toda su información asociada. Esta
            acción no tiene vuelta atrás.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={processing} onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <Button onClick={onDeleteMatch} disabled={processing}>
            {processing ? (
              <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
            ) : null}
            {processing ? "Eliminando..." : "Sí, eliminar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
