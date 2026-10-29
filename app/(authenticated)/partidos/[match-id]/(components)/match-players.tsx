import {
  AddPlayer,
  PlayerLimitAlert,
} from "@/app/(authenticated)/partidos/[match-id]/(components)/add-player";
import { DeletePlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/delete-player";
import { EditPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/edit-player";
import { AnimatedListItem } from "@/components/animated-list-item";
import { useRosterViewport } from "@/app/(authenticated)/partidos/[match-id]/(hooks)/use-roster-viewport";
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
import { cn } from "@/utils/cn";
import { MAX_PLAYERS_PER_MATCH } from "@/utils/player-limits";
import { type Player } from "@prisma/client";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { type FC, useRef, useState } from "react";

type MatchPlayersProps = {
  players: Player[];
};

export const MatchPlayers: FC<MatchPlayersProps> = ({ players }) => {
  const columnRef = useRosterViewport();
  const atPlayerLimit = players.length >= MAX_PLAYERS_PER_MATCH;
  const canListPlayers = Array.isArray(players) && players.length;

  return (
    <div ref={columnRef} className="min-w-0 lg:[min-block-size:var(--roster-min-height,calc(100dvh-15rem-2px))]">
      {/* A zero-height sticky anchor keeps card resizing out of page layout. */}
      <div className="lg:sticky lg:[inset-block-start:var(--roster-inset,73px)] lg:[block-size:0]">
        <Card className="lg:flex lg:[block-size:var(--roster-height,calc(100dvh-15rem-2px))] lg:flex-col">
          <CardHeader className="flex-row flex-wrap gap-3 items-center justify-between space-y-0 p-4 sm:p-6 lg:shrink-0">
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
          {canListPlayers ? (
            <CardContent className="px-4 pe-2 sm:px-6 sm:pe-3 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
              {/* Keep large rosters scrollable independently of the team builder. */}
              <ScrollArea
                className={cn(
                  players.length > 10 ? "h-96" : "h-auto",
                  "lg:h-auto lg:min-h-0 lg:flex-1 lg:[&>[data-radix-scroll-area-viewport]]:overscroll-y-contain",
                )}
              >
                <div className="me-3 space-y-4">
                  {atPlayerLimit ? <PlayerLimitAlert /> : null}
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
      </div>
    </div>
  );
};

type MatchPlayerProps = {
  player: Player;
};

const MatchPlayer: FC<MatchPlayerProps> = ({ player }) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [dialogId, setDialogId] = useState<"edit" | "delete" | null>(null);
  const pendingDialog = useRef<typeof dialogId>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);

  return (
    <Card>
      <div className="ps-2">
        <PlayerRow player={player} compact>
          <div className="flex-shrink-0">
            <DropdownMenu open={menuOpened} onOpenChange={setMenuOpened}>
              <DropdownMenuTrigger asChild>
                <Button
                  ref={menuTrigger}
                  variant="ghost"
                  size="icon"
                  aria-label={`Acciones de ${player.name}`}
                >
                  <EllipsisVerticalIcon className="h-4 text-muted-foreground w-4" />
                </Button>
              </DropdownMenuTrigger>
              {/* Margin here helps to detach the menu from the limit of the screen (specially in mobile) */}
              <DropdownMenuContent
                className="mr-4"
                onCloseAutoFocus={() => {
                  // Wait for the menu's exit and modal cleanup before opening a dialog.
                  const nextDialog = pendingDialog.current;
                  pendingDialog.current = null;
                  if (nextDialog) setDialogId(nextDialog);
                }}
              >
                <DropdownMenuItem
                  onSelect={() => {
                    pendingDialog.current = "edit";
                  }}
                >
                  <PencilIcon className="h-4 mr-2 text-muted-foreground w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    pendingDialog.current = "delete";
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
            onCloseAutoFocus={() => menuTrigger.current?.focus()}
            onClose={() => {
              setDialogId(null);
              setMenuOpened(false);
            }}
          />
        ) : null}
        {dialogId === "delete" ? (
          <DeletePlayer
            id={player.id}
            onCloseAutoFocus={() => menuTrigger.current?.focus()}
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
