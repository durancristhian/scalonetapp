import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { SpicyTooltips } from "@/components/spicy-tooltips";
import { Button } from "@/components/ui/button";
import { deletePlayer } from "@/server/actions/player";
import { Player } from "@prisma/client";
import { default as BoringAvatar } from "boring-avatars";
import { LoaderCircleIcon, TrashIcon } from "lucide-react";
import { FC } from "react";
import { useFormState, useFormStatus } from "react-dom";

type MatchPlayersProps = {
  players: Player[];
};

export const MatchPlayers: FC<MatchPlayersProps> = ({ players }) => {
  const canListPlayers = Array.isArray(players) && players.length;

  return (
    <>
      {canListPlayers ? (
        <ul className="grid gap-2">
          {players.map((player, idx) => {
            return (
              <AnimatedListItem key={player.id} listIndex={idx}>
                <MatchPlayer player={player} />
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
};

const MatchPlayer: FC<MatchPlayerProps> = ({ player }) => {
  const deletePlayerWithId = deletePlayer.bind(null, player.id);
  const [_, deletePlayerAction] = useFormState(deletePlayerWithId, null);

  return (
    <div className="flex items-center gap-2">
      <form action={deletePlayerAction} className="inline-flex">
        <SubmitButton />
      </form>
      <div className="grow">
        <div className="border border-slate-300 px-4 py-2 rounded-md">
          <div className="flex gap-2 items-center">
            <SpicyTooltips>
              <BoringAvatar variant="beam" name={player.name} size={24} />
            </SpicyTooltips>
            <div className="grow">
              <p>{player.name}</p>
            </div>
          </div>
        </div>
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
