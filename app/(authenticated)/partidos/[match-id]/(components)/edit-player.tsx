import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { PlayerForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/player-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlayerSchema } from "@/schemas/player";
import { editPlayerAction } from "@/server/actions/player";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { Player } from "@prisma/client";
import { FC } from "react";

type EditPlayerProps = {
  player: Player;
  onClose: () => void;
};

export const EditPlayer: FC<EditPlayerProps> = ({ player, onClose }) => {
  const { errorAlert } = useAlerts();

  const onSubmit: (values: PlayerSchema) => Promise<void> = async (values) => {
    return new Promise(async (resolve, reject) => {
      try {
        await editPlayerAction(player.id, values);

        onClose();

        resolve();
      } catch (error) {
        if (error instanceof Error) {
          errorAlert({
            title:
              error.message in ERROR_MESSAGES
                ? ERROR_MESSAGES[error.message as keyof typeof ERROR_MESSAGES]
                : ERROR_MESSAGES.player_edit_error,
          });
        }

        reject(error);
      }
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar ficha del jugador</DialogTitle>
        </DialogHeader>
        <PlayerForm onSubmit={onSubmit} values={player} />
      </DialogContent>
    </Dialog>
  );
};
