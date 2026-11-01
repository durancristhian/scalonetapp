"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { Button } from "@/components/ui/button";
import { type Team } from "@/types/team";
import { byName } from "@/utils/by-name";
import copy from "copy-to-clipboard";
import { type FC } from "react";

type CopyTeamsProps = {
  teams: Team[];
};

export const CopyTeams: FC<CopyTeamsProps> = ({ teams }) => {
  const { successAlert, errorAlert } = useAlerts();

  const copyTeams = async () => {
    const text = `${teams
      .map((team) => {
        const players = [...team.players]
          .sort(byName)
          .map((player) => `- ${player.name}`)
          .join("\n");

        return `${team.name}:\n${players}`;
      })
      .join("\n\n")}`;

    try {
      if (await copy(text)) {
        successAlert({ title: "¡Equipos copiados al portapapeles!" });
        return;
      }
    } catch {}

    errorAlert({
      title:
        "No pudimos copiar los equipos. Volvé a intentarlo y permití el acceso al portapapeles.",
    });
  };

  return (
    <Button onClick={copyTeams} variant="outline">
      Copiar
    </Button>
  );
};
