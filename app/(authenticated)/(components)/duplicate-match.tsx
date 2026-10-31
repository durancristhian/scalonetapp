"use client";

import { trackAnalytics } from "@/utils/analytics";
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
import { duplicateMatchAction } from "@/server/actions/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { type FC, useRef, useState } from "react";

const duplicateErrors = {
  unauthorized: ERROR_MESSAGES.unauthorized,
  not_found: ERROR_MESSAGES.not_found,
  match_limit: ERROR_MESSAGES.match_limit_reached,
  player_limit: ERROR_MESSAGES.match_duplicate_player_limit,
  unexpected: ERROR_MESSAGES.match_duplicate_error,
};

type DuplicateMatchProps = {
  id: number;
  onClose: () => void;
};

export const DuplicateMatch: FC<DuplicateMatchProps> = ({ id, onClose }) => {
  const [processing, setIsProcessing] = useState(false);
  const pending = useRef(false);
  const { errorAlert, successAlert } = useAlerts();

  const onDuplicateMatch: () => Promise<void> = async () => {
    if (pending.current) return;
    pending.current = true;
    setIsProcessing(true);
    try {
      const result = await duplicateMatchAction(id);
      if (!result.ok) {
        errorAlert({
          title:
            duplicateErrors[result.code] ||
            ERROR_MESSAGES.match_duplicate_error,
          description: result.reference
            ? `Referencia: ${result.reference}`
            : undefined,
        });
        return;
      }
      trackAnalytics("match_duplicated");
      successAlert({
        title: "¡Partido duplicado!",
      });
      onClose();
    } catch {
      errorAlert({ title: ERROR_MESSAGES.match_duplicate_error });
    } finally {
      pending.current = false;
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open>
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (pending.current) event.preventDefault();
          else onClose();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>¿Duplicar este partido?</AlertDialogTitle>
          <AlertDialogDescription className="max-md:text-balance">
            Se creará un nuevo partido basado en el actual con un nombre
            modificado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={processing}>
            Cancelar
          </AlertDialogCancel>
          <Button onClick={onDuplicateMatch} disabled={processing}>
            {processing ? (
              <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
            ) : null}
            {processing ? "Duplicando..." : "Sí, duplicar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
