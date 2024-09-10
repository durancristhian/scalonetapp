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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteMatch } from "@/server/actions/match";
import { TrashIcon } from "lucide-react";
import { FC } from "react";

type DeleteMatchProps = {
  id: number;
};

export const DeleteMatch: FC<DeleteMatchProps> = ({ id }) => {
  const { errorAlert, successAlert } = useAlerts();

  const onDeleteMatch: () => Promise<void> = async () => {
    try {
      await deleteMatch(id);

      successAlert({ title: "¡Partido eliminado!" });
    } catch (error) {
      console.error(error);

      errorAlert({
        title: "Error en la eliminación del partido",
        description: "¿Podrías volver a intentarlo?.",
      });
    }
  };

  return (
    <AlertDialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <TrashIcon className="h-4 text-red-700 w-4" />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
