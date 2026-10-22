import {
  AddPlayer,
  PlayerLimitAlert,
} from "@/app/(authenticated)/partidos/[match-id]/(components)/add-player";
import { DeletePlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/delete-player";
import { EditPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/edit-player";
import { AnimatedListItem } from "@/components/animated-list-item";
import { PlayerRow } from "@/components/player-row";
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
      <CardHeader className="flex-row flex-wrap gap-3 items-center justify-between space-y-0 p-4 sm:p-6">
        <div className="min-w-0 flex-1 space-y-1">
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
        <CardContent className="px-4 pe-2 sm:px-6 sm:pe-3">
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
      <div className="ps-2">
        <PlayerRow player={player} compact>
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
        </PlayerRow>
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
