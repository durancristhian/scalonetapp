"use client";

import { CopyTeams } from "@/app/matches/[match-id]/(components)/copy-teams";
import { ExportTeams } from "@/app/matches/[match-id]/(components)/export-teams";
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
import { PlayerSchema } from "@/schemas/player";
import { addPlayer } from "@/server/actions/player";
import { MatchWithPlayers } from "@/server/queries/match";
import { useParams } from "next/navigation";
import { FC, useCallback } from "react";

type MatchDetailsProps = {
  match: MatchWithPlayers;
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
  } = useTeamsBuilderState(match);

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
        <div className="grid gap-4">
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle>Agregar un jugador</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerForm onSubmit={onPlayerSubmit} />
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle>
                Jugadores
                {match.players.length ? `: ${match.players.length}` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MatchPlayers players={match.players} />
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="grid gap-8">
          <div>
            <CardTitle className="mb-1.5">Vamos a armar los equipos</CardTitle>
            <CardDescription>
              {unselectedPlayers.length
                ? "Seleccioná jugadores de la siguiente lista para luego agregarlos a uno de los equipos."
                : "Listo! Ya agregaste a todos los jugadores en algún equipo."}
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
            <Button onClick={createNewTeam} variant="outline" size="sm">
              Agregar otro equipo
            </Button>
            <div className="flex gap-2">
              <CopyTeams teams={teams} />
              <ExportTeams
                disabled={!areTeamsValid()}
                matchId={match.id}
                teams={teams}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
