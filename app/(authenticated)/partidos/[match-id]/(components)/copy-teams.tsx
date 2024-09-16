"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { Button } from "@/components/ui/button";
import { Team } from "@/types/team";
import { byName } from "@/utils/by-name";
import copy from "copy-to-clipboard";
import { FC } from "react";

type CopyTeamsProps = {
  disabled: boolean;
  teams: Team[];
};

export const CopyTeams: FC<CopyTeamsProps> = ({ disabled, teams }) => {
  const { successAlert } = useAlerts();

  const copyTeams = () => {
    const text = `${teams
      .map((team) => {
        const players = team.players
          .sort(byName)
          .map((player) => `- ${player.name}`)
          .join("\n");

        return `${team.name}:\n${players}`;
      })
      .join("\n\n")}`;

    copy(text);

    successAlert({
      title: "¡Equipos copiados al portapapeles!",
    });
  };

  return (
    <Button onClick={copyTeams} disabled={disabled} variant="outline">
      Copiar equipos
    </Button>
  );
};
