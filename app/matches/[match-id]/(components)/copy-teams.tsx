"use client";

import { Team } from "@/app/matches/[match-id]/hooks/use-team-builder-state";
import { Button } from "@/components/ui/button";
import copy from "copy-to-clipboard";
import { PartyPopperIcon } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

type CopyTeamsProps = {
  teams: Team[];
};

export const CopyTeams: FC<CopyTeamsProps> = ({ teams }) => {
  const copyTeams = () => {
    const text = `${teams
      .map((team) => {
        const players = team.players
          .sort((playerA, playerB) => playerA.name.localeCompare(playerB.name))
          .map((player) => `- ${player.name}`)
          .join("\n");

        return `${team.name}:\n${players}`;
      })
      .join("\n\n")}`;

    copy(text);

    toast("Equipos copiados al portapapeles.", {
      icon: <PartyPopperIcon className="h-4 opacity-50 w-4" />,
    });
  };

  return (
    <Button onClick={copyTeams} variant="outline" size="sm">
      Copiar
    </Button>
  );
};
