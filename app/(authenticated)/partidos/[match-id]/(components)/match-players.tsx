import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { AddPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/add-player";
import { DeletePlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/delete-player";
import { PlayerForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/player-form";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { PlayerAvatar } from "@/components/player-avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlayerSchema } from "@/schemas/player";
import { editPlayer } from "@/server/actions/player";
import { byName } from "@/utils/by-name";
import { Player } from "@prisma/client";
import { PencilIcon } from "lucide-react";
import { FC, useState } from "react";
import { ZodError } from "zod";

type MatchPlayersProps = {
  players: Player[];
};

export const MatchPlayers: FC<MatchPlayersProps> = ({ players }) => {
  const { errorAlert } = useAlerts();

  const canListPlayers = Array.isArray(players) && players.length;

  const onPlayerSubmit: (id: number, values: PlayerSchema) => Promise<void> = (
    id,
    values
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        await editPlayer(id, values);

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
              "Por favor, verifica la información y prueba otra vez.",
          });
        }

        reject(error);
      }
    });
  };

  return (
    <>
      <Card>
        {/* Instead of using CardHeader and overwriting too many classes I decided to write my own */}
        <div className="flex gap-2 items-center justify-between p-6">
          <CardTitle>
            Jugadores
            {players.length
              ? `: ${players.length} de ${process.env.NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH}`
              : ""}
          </CardTitle>
          <AddPlayer
            disabled={
              players.length >=
              Number(process.env.NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH)
            }
          />
        </div>
        <CardContent>
          {canListPlayers ? (
            <div className="grid gap-6">
              <ul className="grid gap-2">
                {players.sort(byName).map((player, idx) => {
                  return (
                    <AnimatedListItem key={player.id} listIndex={idx}>
                      <MatchPlayer
                        player={player}
                        onPlayerSubmit={onPlayerSubmit}
                      />
                    </AnimatedListItem>
                  );
                })}
              </ul>
            </div>
          ) : (
            <EmptyState>
              Parece que aún no has agregado a nadie. ¡Es hora de llenar la
              plantilla!
            </EmptyState>
          )}
        </CardContent>
      </Card>
    </>
  );
};

type MatchPlayerProps = {
  player: Player;
  onPlayerSubmit: (id: number, values: PlayerSchema) => Promise<void>;
};

const MatchPlayer: FC<MatchPlayerProps> = ({ player, onPlayerSubmit }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const onSubmit: (values: PlayerSchema) => Promise<void> = async (values) => {
    await onPlayerSubmit(player.id, values);

    setDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <DeletePlayer id={player.id} />
      <div className="grow">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="w-full">
            <div className="border border-border hover:bg-accent px-4 py-2 rounded-md transition-colors">
              <div className="flex gap-2 items-center">
                <div className="grow">
                  <div className="flex gap-2 items-center">
                    <PlayerAvatar
                      src={player.avatar}
                      name={player.name}
                      size="sm"
                    />
                    <p>{player.name}</p>
                  </div>
                </div>
                <PencilIcon className="h-4 text-muted-foreground w-4" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar ficha del jugador</DialogTitle>
            </DialogHeader>
            <PlayerForm onSubmit={onSubmit} values={player} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
