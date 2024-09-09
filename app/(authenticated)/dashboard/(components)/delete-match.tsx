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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteMatch } from "@/server/actions/match";
import { BugIcon, TrashIcon } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

type DeleteMatchProps = {
  id: number;
};

export const DeleteMatch: FC<DeleteMatchProps> = ({ id }) => {
  const onDeleteMatch: () => Promise<void> = async () => {
    try {
      await deleteMatch(id);

      toast("Se ha eliminado tu partido", {
        icon: <TrashIcon className="h-4 opacity-50 w-4" />,
      });
    } catch (error) {
      console.error(error);

      toast("Ha ocurrido un error", {
        description:
          "No pudimos borrar el partido. ¿Podrías volver a intentarlo?.",
        icon: <BugIcon className="h-4 opacity-50 w-4" />,
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
          <AlertDialogTitle>
            ¿Estás seguro de eliminar este partido?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer.
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
