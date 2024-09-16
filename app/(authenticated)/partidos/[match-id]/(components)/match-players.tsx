import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { AddPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/add-player";
import { DeletePlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/delete-player";
import { EditPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/edit-player";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { PlayerAvatar } from "@/components/player-avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { PlayerSchema } from "@/schemas/player";
import { editPlayer } from "@/server/actions/player";
import { byName } from "@/utils/by-name";
import { Player } from "@prisma/client";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { FC, Fragment, useState } from "react";
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
          <div className="space-y-1">
            <CardTitle>Jugadores</CardTitle>
            <CardDescription>
              {players.length
                ? `${players.length} de ${process.env.NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH}`
                : ""}
            </CardDescription>
          </div>
          <AddPlayer
            disabled={
              players.length >=
              Number(process.env.NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH)
            }
          />
        </div>
        <CardContent>
          {canListPlayers ? (
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
  const [menuOpened, setMenuOpened] = useState(false);
  /* This is not great at all but enough for now due to the small amout of options we have in the dropdown menu */
  const [dialogId, setDialogId] = useState<"edit" | "delete" | null>(null);

  return (
    <Card>
      <div className="flex gap-2 items-center pl-4">
        <PlayerAvatar src={player.avatar} name={player.name} size="sm" />
        <div className="grow">
          <p>{player.name}</p>
        </div>
        <div className="flex-shrink-0">
          <DropdownMenu open={menuOpened} onOpenChange={setMenuOpened}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon className="h-4 text-muted-foreground w-4" />
              </Button>
            </DropdownMenuTrigger>
            {/* margin here helps to detach the menu from the limit of the screen (specially in mobile) */}
            <DropdownMenuContent className="mr-4">
              <DropdownMenuItem
                onClick={() => {
                  setDialogId("edit");
                }}
              >
                <PencilIcon className="h-4 mr-2 text-muted-foreground w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDialogId("delete");
                }}
              >
                <TrashIcon className="h-4 mr-2 text-destructive w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {dialogId === "edit" ? (
          <EditPlayer
            player={player}
            onClose={() => {
              setDialogId(null);
              setMenuOpened(false);
            }}
          />
        ) : null}
        {dialogId === "delete" ? (
          <DeletePlayer
            id={player.id}
            onClose={() => {
              setDialogId(null);
              setMenuOpened(false);
            }}
          />
        ) : null}
      </div>
    </Card>
  );
};
