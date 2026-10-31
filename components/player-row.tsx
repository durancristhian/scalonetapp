import { PlayerAvatar } from "@/components/player-avatar";
import { Badge } from "@/components/ui/badge";
import { PLAYER_POSITIONS } from "@/utils/player-positions";
import type { Player } from "@prisma/client";
import type { ReactNode } from "react";

type PlayerRowProps = {
  player: Player;
  compact?: boolean;
  children: ReactNode;
};

export function PlayerRow({
  player,
  compact = false,
  children,
}: PlayerRowProps) {
  return (
    <div className="grid min-h-12 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 py-1">
      <PlayerAvatar
        src={player.avatar}
        name={player.name}
        size="sm"
        className={compact ? undefined : "size-8 sm:size-12"}
      />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="line-clamp-2 break-words leading-5" title={player.name}>
          {player.name}
        </p>
        <div className="flex items-center gap-1">
          <Badge variant={player.position} className="justify-center uppercase">
            {PLAYER_POSITIONS[player.position].substring(0, 3)}
          </Badge>
          <Badge
            variant="secondary"
            className="min-w-6 justify-center tabular-nums"
          >
            {player.level}
          </Badge>
        </div>
      </div>
      <div className="flex shrink-0 self-start items-center pe-2 [padding-block-start:theme(spacing.1)]">
        {children}
      </div>
    </div>
  );
}
