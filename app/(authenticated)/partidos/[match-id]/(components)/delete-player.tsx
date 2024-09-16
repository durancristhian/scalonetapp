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
import { deletePlayer } from "@/server/actions/player";
import { useAction } from "next-safe-action/hooks";
import { FC } from "react";

type DeletePlayerProps = {
  id: number;
  onClose: () => void;
};

export const DeletePlayer: FC<DeletePlayerProps> = ({ id, onClose }) => {
  const { executeAsync, isExecuting } = useAction(deletePlayer);
  const { errorAlert } = useAlerts();

  const onSubmitAction = async (values: FormData) => {
    try {
      await executeAsync(values);

      onClose();
    } catch (error) {
      console.error(error);

      errorAlert({
        title: "Error al eliminar el jugador",
      });
    }
  };

  return (
    <AlertDialog open>
      <AlertDialogContent onEscapeKeyDown={onClose}>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este jugador?</AlertDialogTitle>
          <AlertDialogDescription className="max-md:text-balance">
            Ten en cuenta que se eliminará toda la información asociada a él.
            Esta acción no tiene vuelta atrás.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <form action={onSubmitAction}>
            <input type="hidden" name="id" value={id} />
            <AlertDialogAction asChild>
              <Button type="submit">
                {isExecuting ? (
                  <>
                    <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
                    Eliminando...
                  </>
                ) : (
                  "Sí, eliminar"
                )}
              </Button>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
