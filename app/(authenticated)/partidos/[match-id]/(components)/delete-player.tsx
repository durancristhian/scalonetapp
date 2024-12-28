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
import { deletePlayerAction } from "@/server/actions/player";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { type FC, useState } from "react";

type DeletePlayerProps = {
  id: number;
  onClose: () => void;
};

export const DeletePlayer: FC<DeletePlayerProps> = ({ id, onClose }) => {
  const [processing, setIsProcessing] = useState(false);
  const { errorAlert } = useAlerts();

  const onDeletePlayer = async () => {
    try {
      setIsProcessing(true);

      await deletePlayerAction(id);

      setIsProcessing(false);

      onClose();
    } catch (error) {
      if (error instanceof Error) {
        errorAlert({
          title: error.message || ERROR_MESSAGES.player_delete_error,
        });
      }

      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open>
      <AlertDialogContent onEscapeKeyDown={onClose}>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este jugador?</AlertDialogTitle>
          <AlertDialogDescription className="max-md:text-balance">
            Ten en cuenta que se eliminará toda su información asociada. Esta
            acción no tiene vuelta atrás.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onDeletePlayer} disabled={processing}>
              {processing ? (
                <>
                  <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
                  Eliminando...
                </>
              ) : (
                "Sí, eliminar"
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
