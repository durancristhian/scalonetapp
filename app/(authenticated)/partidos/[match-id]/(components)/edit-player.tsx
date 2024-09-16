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
import { Player } from "@prisma/client";
import { FC } from "react";
import { ZodError } from "zod";

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
        console.error(error);

        if (error instanceof ZodError) {
          errorAlert({
            title: "Error en la edición del jugador",
            description: (
              <ul className="list-disc list-inside">
                {error.errors.map(({ message }, idx) => (
                  <li key={idx}>{message}</li>
                ))}
              </ul>
            ),
          });
        } else {
          errorAlert({
            title: "Error en la edición del jugador",
            description:
              "Por favor, verifica la información y prueba nuevamente.",
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
