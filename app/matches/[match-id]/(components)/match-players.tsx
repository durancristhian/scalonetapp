import { EmptyState } from "@/components/empty-state";
import { SpicyTooltips } from "@/components/spicy-tooltips";
import { Button } from "@/components/ui/button";
import { deletePlayer } from "@/server/actions/player";
import { Player } from "@prisma/client";
import { default as BoringAvatar } from "boring-avatars";
import { motion } from "framer-motion";
import { TrashIcon } from "lucide-react";
import { FC } from "react";

type MatchPlayersProps = {
  players: Player[];
};

export const MatchPlayers: FC<MatchPlayersProps> = ({ players }) => {
  if (!Array.isArray(players) || !players.length) {
    return (
      <EmptyState>
        Las personas que agregues van a aparecer listadas acá.
      </EmptyState>
    );
  }

  return (
    <ul className="grid gap-2">
      {players.map((player, idx) => {
        const deletePlayerWithId = deletePlayer.bind(null, player.id);

        return (
          <motion.li
            key={player.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: idx * 0.15 }}
          >
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
          </motion.li>
        );
      })}
    </ul>
  );
};
