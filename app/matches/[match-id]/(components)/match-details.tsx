"use client";

import { MatchPlayers } from "@/app/matches/[match-id]/(components)/match-players";
import { PlayerForm } from "@/app/matches/[match-id]/(components)/player-form";
import { PlayersList } from "@/app/matches/[match-id]/(components)/players-list";
import { TeamCard } from "@/app/matches/[match-id]/(components)/team-card";
import { useTeamsBuilderState } from "@/app/matches/[match-id]/hooks/use-team-builder-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlayerSchema } from "@/schemas/player";
import { addPlayer } from "@/server/actions/player";
import { getMatchById } from "@/server/queries/match";
import { Prisma } from "@prisma/client";
import copy from "copy-to-clipboard";
import { PartyPopper } from "lucide-react";
import { useParams } from "next/navigation";
import { FC, useCallback } from "react";
import { toast } from "sonner";

/* We create this type since Prisma doesn't return relationships in the generated types */
type Match = NonNullable<Prisma.PromiseReturnType<typeof getMatchById>>;

type MatchDetailsProps = {
  match: Match;
};

export const MatchDetails: FC<MatchDetailsProps> = ({ match }) => {
  const params = useParams();
  const {
    assignSelectionToTeam,
    createNewTeam,
    removePlayerFromTeam,
    removeTeam,
    selectedIds,
    teams,
    togglePlayer,
    unselectedPlayers,
    updateTeamName,
  } = useTeamsBuilderState(match.players);

  const playersTitle = match.players.length
    ? `Jugadores (${match.players.length})`
    : "Agregar jugadores";

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
      icon: <PartyPopper className="h-4 opacity-50 w-4" />,
    });
  };

  /* We consider teams are valid when there is no unselected players AND all teams have a valid name */
  const areTeamsValid: () => boolean = useCallback(() => {
    const validTeamNames = teams.every((team) => Boolean(team.name));

    return !unselectedPlayers.length && validTeamNames;
  }, [teams, unselectedPlayers]);

  const onPlayerSubmit: (values: PlayerSchema) => Promise<void> = (values) => {
    return addPlayer(values, Number(params["match-id"]));
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle>{playersTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <PlayerForm onSubmit={onPlayerSubmit} />
              <Separator />
              <MatchPlayers players={match.players} />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <div className="grid gap-8">
          <div>
            <CardTitle className="mb-1.5">Los equipos</CardTitle>
            <CardDescription>
              {unselectedPlayers.length
                ? "Seleccioná jugadores de la siguiente para luego agregarlos a uno de los equipos."
                : "Listo! Ya agregaste a todos los jugadores en algún equipo. Ahora podés guardarlos."}
            </CardDescription>
          </div>
          <PlayersList
            assignSelectionToTeam={assignSelectionToTeam}
            canAssignSelection={!selectedIds.length}
            players={unselectedPlayers}
            selectedIds={selectedIds}
            teams={teams}
            togglePlayer={togglePlayer}
          />
          <div className="grid md:grid-cols-2 gap-4">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                canBeDeleted={teams.length > 1}
                removePlayerFromTeam={removePlayerFromTeam}
                removeTeam={removeTeam}
                team={team}
                updateTeamName={updateTeamName}
              />
            ))}
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="outline" size="sm" onClick={createNewTeam}>
              Agregar otro equipo
            </Button>
            <Button size="sm" onClick={copyTeams} disabled={!areTeamsValid()}>
              Copiar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
