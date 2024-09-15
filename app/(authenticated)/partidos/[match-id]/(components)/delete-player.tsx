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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deletePlayer } from "@/server/actions/player";
import { TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { FC, useState } from "react";

type DeletePlayerProps = {
  id: number;
};

export const DeletePlayer: FC<DeletePlayerProps> = ({ id }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { executeAsync, isExecuting } = useAction(deletePlayer);
  const { errorAlert } = useAlerts();

  const onSubmitAction = async (values: FormData) => {
    try {
      await executeAsync(values);

      setDialogOpen(false);
    } catch (error) {
      console.error(error);

      errorAlert({
        title: "Error al eliminar el jugador",
      });
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                setDialogOpen(true);
              }}
              variant="ghost"
              size="icon"
            >
              <TrashIcon className="h-4 text-destructive w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AlertDialog open={dialogOpen}>
        <AlertDialogContent
          onEscapeKeyDown={() => {
            setDialogOpen(false);
          }}
        >
          <form action={onSubmitAction}>
            <input type="hidden" name="id" value={id} />
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este jugador?</AlertDialogTitle>
              <AlertDialogDescription className="max-md:text-balance">
                Ten en cuenta que se eliminará toda la información asociada a
                él. Esta acción no tiene vuelta atrás.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDialogOpen(false);
                }}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button type="submit">
                  {isExecuting ? (
                    <>
                      <SoccerBall className="animate-spin h-4 opacity-50 w-4" />
                      Eliminando...
                    </>
                  ) : (
                    "Sí, eliminar"
                  )}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
