import { PlayerForm } from "@/app/matches/[match-id]/(components)/player-form";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { SpicyTooltips } from "@/components/spicy-tooltips";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlayerSchema } from "@/schemas/player";
import { deletePlayer, editPlayer } from "@/server/actions/player";
import { Player } from "@prisma/client";
import { default as BoringAvatar } from "boring-avatars";
import { LoaderCircleIcon, PencilIcon, TrashIcon } from "lucide-react";
import { FC, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

type MatchPlayersProps = {
  players: Player[];
};

export const MatchPlayers: FC<MatchPlayersProps> = ({ players }) => {
  const canListPlayers = Array.isArray(players) && players.length;

  const onPlayerSubmit: (
    playerId: number,
    values: PlayerSchema
  ) => Promise<void> = (playerId, values) => {
    return editPlayer(playerId, values);
  };

  return (
    <>
      {canListPlayers ? (
        <ul className="grid gap-2">
          {players.map((player, idx) => {
            return (
              <AnimatedListItem key={player.id} listIndex={idx}>
                <MatchPlayer player={player} onPlayerSubmit={onPlayerSubmit} />
              </AnimatedListItem>
            );
          })}
        </ul>
      ) : (
        <EmptyState>
          Las personas que agregues van a aparecer listadas acá.
        </EmptyState>
      )}
    </>
  );
};

type MatchPlayerProps = {
  player: Player;
  onPlayerSubmit: (playerId: number, values: PlayerSchema) => Promise<void>;
};

const MatchPlayer: FC<MatchPlayerProps> = ({ player, onPlayerSubmit }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  /* This looks ugly, I know */
  const deletePlayerWithId = deletePlayer.bind(null, player.id);
  const [_, deletePlayerAction] = useFormState(deletePlayerWithId, null);

  return (
    <div className="flex items-center gap-2">
      <form action={deletePlayerAction} className="inline-flex">
        <SubmitButton />
      </form>
      <div className="grow">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="w-full">
            <div className="border border-slate-300 hover:bg-slate-100 px-4 py-2 rounded-md transition-colors">
              <div className="flex gap-2 items-center">
                <div className="grow">
                  <div className="flex gap-2 items-center">
                    <SpicyTooltips>
                      <BoringAvatar
                        variant="beam"
                        name={player.name}
                        size={24}
                      />
                    </SpicyTooltips>
                    <p>{player.name}</p>
                  </div>
                </div>
                <PencilIcon className="h-4 text-slate-500 w-4" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar jugador</DialogTitle>
            </DialogHeader>
            <PlayerForm
              onSubmit={(values) => onPlayerSubmit(player.id, values)}
              values={{
                name: player.name,
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant="ghost" size="icon">
      {pending ? (
        <LoaderCircleIcon className="animate-spin h-4 opacity-50 w-4" />
      ) : (
        <TrashIcon className="h-4 text-red-700 w-4" />
      )}
    </Button>
  );
};
