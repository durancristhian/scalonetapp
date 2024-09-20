import { AddPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/add-player";
import { DeletePlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/delete-player";
import { EditPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/edit-player";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { PlayerAvatar } from "@/components/player-avatar";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { byName } from "@/utils/by-name";
import { PLAYER_POSITIONS } from "@/utils/player-positions";
import { Player } from "@prisma/client";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { FC, useState } from "react";

type MatchPlayersProps = {
  players: Player[];
};

export const MatchPlayers: FC<MatchPlayersProps> = ({ players }) => {
  const canListPlayers = Array.isArray(players) && players.length;

  return (
    <Card>
      {/* Instead of using CardHeader and overwriting too many classes I decided to write my own */}
      <div className="flex gap-2 items-center justify-between p-6">
        <div className="space-y-1">
          <CardTitle>Jugadores convocados</CardTitle>
          {players.length ? (
            <CardDescription>
              {players.length} de{" "}
              {process.env.NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH}
            </CardDescription>
          ) : null}
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
          /* 435 is a magical number. It's the height of 9.5 items (+ the margin separating them) so we only show those items and there is some sort of visual guidance to scroll if you want to see more */
          <ScrollArea className={players.length > 10 ? "h-[435px]" : "h-auto"}>
            <ul className="space-y-2">
              {players.sort(byName).map((player, idx) => {
                return (
                  <AnimatedListItem key={player.id} listIndex={idx}>
                    <MatchPlayer player={player} />
                  </AnimatedListItem>
                );
              })}
            </ul>
          </ScrollArea>
        ) : (
          <EmptyState>Parece que aún no has llamado a nadie.</EmptyState>
        )}
      </CardContent>
    </Card>
  );
};

type MatchPlayerProps = {
  player: Player;
};

const MatchPlayer: FC<MatchPlayerProps> = ({ player }) => {
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
          <Badge variant="secondary" className="uppercase">
            {PLAYER_POSITIONS[player.position].substring(0, 3)}
          </Badge>
        </div>
        <div className="flex-shrink-0">
          <Badge variant="secondary">{player.level}</Badge>
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
