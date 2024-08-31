import { SpicyTooltips } from "@/components/spicy-tooltips";
import { Button } from "@/components/ui/button";
import { deletePlayer } from "@/server/actions/player";
import { Player } from "@prisma/client";
import { default as BoringAvatar } from "boring-avatars";
import { TrashIcon } from "lucide-react";
import { FC } from "react";

type MatchPlayersProps = {
  players: Player[];
};

export const MatchPlayers: FC<MatchPlayersProps> = ({ players }) => {
  if (!players.length) {
    return <p>Las personas que agregues van a aparecer listadas acá.</p>;
  }

  return (
    <ul className="grid gap-2">
      {players.map((player) => {
        const deletePlayerWithId = deletePlayer.bind(null, player.id);

        return (
          <li key={player.id}>
            <div className="flex items-center gap-2">
              <form action={deletePlayerWithId} className="inline-flex">
                <Button type="submit" variant="ghost" size="icon">
                  <TrashIcon className="h-4 text-red-700 w-4" />
                </Button>
              </form>
              <div className="grow">
                <div className="border border-slate-300 px-4 py-2 rounded-md">
                  <div className="flex gap-2 items-center">
                    <SpicyTooltips>
                      <BoringAvatar
                        variant="beam"
                        name={player.name}
                        size={24}
                      />
                    </SpicyTooltips>
                    <div className="grow">
                      <p>{player.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
