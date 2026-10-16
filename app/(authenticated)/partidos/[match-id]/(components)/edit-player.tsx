import { savePlayerPhoto } from "@/utils/save-player-photo";
import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { PlayerForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/player-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type PlayerSchema } from "@/schemas/player";
import { editPlayerAction } from "@/server/actions/player";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { type Player } from "@prisma/client";
import { type FC } from "react";

type EditPlayerProps = {
  player: Player;
  onClose: () => void;
};

export const EditPlayer: FC<EditPlayerProps> = ({ player, onClose }) => {
  const { errorAlert } = useAlerts();

  const onSubmit: (values: PlayerSchema, photo?: Blob | null) => Promise<void> = async (values, photo) => {
    return new Promise(async (resolve, reject) => {
      try {
        await editPlayerAction(player.id, values);
        const id = player.id;
        const photoError = await savePlayerPhoto(id, photo);
        if (photoError) errorAlert({ title: photoError });

        onClose();

        resolve();
      } catch (error) {
        if (error instanceof Error) {
          errorAlert({
            title: error.message || ERROR_MESSAGES.player_edit_error,
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
          <div className="hidden">
            <DialogDescription />
          </div>
        </DialogHeader>
        <PlayerForm onSubmit={onSubmit} values={player} avatar={player.avatar} />
      </DialogContent>
    </Dialog>
  );
};
