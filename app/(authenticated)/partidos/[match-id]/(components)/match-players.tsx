import {
  AddPlayer,
  PlayerLimitAlert,
} from "@/app/(authenticated)/partidos/[match-id]/(components)/add-player";
import { DeletePlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/delete-player";
import { EditPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/edit-player";
import { AnimatedListItem } from "@/components/animated-list-item";
import { PlayerAvatar } from "@/components/player-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import { MAX_PLAYERS_PER_MATCH } from "@/utils/player-limits";
import { type Player } from "@prisma/client";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { type FC, useState } from "react";

type MatchPlayersProps = {
  players: Player[];
};

export const MatchPlayers: FC<MatchPlayersProps> = ({ players }) => {
  const atPlayerLimit = players.length >= MAX_PLAYERS_PER_MATCH;
  const canListPlayers = Array.isArray(players) && players.length;

  return (
    <Card>
      <CardHeader className="flex-row gap-2 items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle>Jugadores convocados</CardTitle>
          {players.length ? (
            <CardDescription>
              {players.length} de {MAX_PLAYERS_PER_MATCH}
            </CardDescription>
          ) : null}
        </div>
        <AddPlayer
          currentPlayerCount={players.length}
          disabled={atPlayerLimit}
        />
      </CardHeader>
      {atPlayerLimit ? (
        <CardContent>
          <PlayerLimitAlert />
        </CardContent>
      ) : null}
      {canListPlayers ? (
        <CardContent className="pe-3">
          {/* Keep large rosters scrollable independently of the team builder. */}
          <ScrollArea className={players.length > 10 ? "h-96" : "h-auto"}>
            <div className="me-3">
              <ul className="space-y-2">
                {[...players].sort(byName).map((player, idx) => {
                  return (
                    <AnimatedListItem key={player.id} listIndex={idx}>
                      <MatchPlayer player={player} />
                    </AnimatedListItem>
                  );
                })}
              </ul>
            </div>
          </ScrollArea>
        </CardContent>
      ) : null}
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
      <div className="flex items-center gap-2 ps-4">
        <PlayerAvatar src={player.avatar} name={player.name} size="sm" />
        <p className="min-w-0 flex-1 py-2 [overflow-wrap:anywhere]">
          {player.name}
        </p>
        <Badge
          variant={player.position}
          className="shrink-0 justify-center uppercase w-12"
        >
          {PLAYER_POSITIONS[player.position].substring(0, 3)}
        </Badge>
        <Badge variant="secondary" className="shrink-0 justify-center w-10">
          {player.level}
        </Badge>
        <div className="flex-shrink-0">
          <DropdownMenu open={menuOpened} onOpenChange={setMenuOpened}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Acciones de ${player.name}`}
              >
                <EllipsisVerticalIcon className="h-4 text-muted-foreground w-4" />
              </Button>
            </DropdownMenuTrigger>
            {/* Margin here helps to detach the menu from the limit of the screen (specially in mobile) */}
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
