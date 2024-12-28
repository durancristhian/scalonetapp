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
import { duplicateMatchAction } from "@/server/actions/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { type FC, useState } from "react";

type DuplicateMatchProps = {
  id: number;
  onClose: () => void;
};

export const DuplicateMatch: FC<DuplicateMatchProps> = ({ id, onClose }) => {
  const [processing, setIsProcessing] = useState(false);
  const { errorAlert, successAlert } = useAlerts();

  const onDuplicateMatch: () => Promise<void> = async () => {
    try {
      setIsProcessing(true);

      await duplicateMatchAction(id);

      setIsProcessing(false);

      successAlert({
        title: "¡Partido duplicado!",
      });

      onClose();
    } catch (error) {
      if (error instanceof Error) {
        errorAlert({
          title: error.message || ERROR_MESSAGES.match_duplicate_error,
        });
      }

      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open>
      <AlertDialogContent onEscapeKeyDown={onClose}>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Duplicar este partido?</AlertDialogTitle>
          <AlertDialogDescription className="max-md:text-balance">
            Se creará un nuevo partido basado en el actual con un nombre
            modificado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onDuplicateMatch} disabled={processing}>
              {processing ? (
                <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
              ) : null}
              {processing ? "Duplicando..." : "Sí, duplicar"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
