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
  onClick: () => void;
  showConfirmation: boolean;
  triggerText: string;
};

export const ConfirmTeamsUpdate: FC<ConfirmTeamsUpdateProps> = ({
  onClick,
  showConfirmation,
  triggerText,
}) => {
  if (!showConfirmation) {
    return <Button onClick={onClick}>{triggerText}</Button>;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>{triggerText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de usar esta opción?
          </AlertDialogTitle>
          <AlertDialogDescription>
            En el caso de confirmar, se va a perder el estado actual de los
            equipos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onClick}>Estoy seguro</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
