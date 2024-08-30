import { Avatar } from "@/components/avatar";
import { Toggle } from "@/components/ui/toggle";
import { Player } from "@prisma/client";
import { FC } from "react";

type PlayersListProps = {
  players: Player[];
  selectedIds: number[];
  togglePlayer: (playerId: number) => void;
};

export const PlayersList: FC<PlayersListProps> = ({
  players,
  selectedIds,
  togglePlayer,
}) => {
  if (!players.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <Toggle
            key={player.id}
            aria-label={player.name}
            variant="outline"
            pressed={selectedIds.includes(player.id)}
            onPressedChange={() => {
              togglePlayer(player.id);
            }}
          >
            <Avatar name={player.name} size={24} />
            <p className="ml-2">{player.name}</p>
          </Toggle>
        ))}
      </div>
    </div>
  );
};
