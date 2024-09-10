"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { Button } from "@/components/ui/button";
import { Team } from "@/types/team";
import { byName } from "@/utils/by-name";
import copy from "copy-to-clipboard";
import { FC } from "react";

type CopyTeamsProps = {
  teams: Team[];
};

export const CopyTeams: FC<CopyTeamsProps> = ({ teams }) => {
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
      description:
        "¡Tus equipos están ahora listos para ser pegados en cualquier parte! Haz lo que quieras con ellos: compártelos, imprímelos o simplemente presúmelos.",
    });
  };

  return (
    <Button onClick={copyTeams} variant="outline">
      Copiar
    </Button>
  );
};
