"use client";

import { AssignPlayers } from "@/app/(authenticated)/partidos/[match-id]/(components)/assign-players";
import { BuildTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/build-teams";
import { CopyTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/copy-teams";
import { ExportTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/export-teams";
import { MatchPlayers } from "@/app/(authenticated)/partidos/[match-id]/(components)/match-players";
import { SaveTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/save-teams";
import { TeamCard } from "@/app/(authenticated)/partidos/[match-id]/(components)/team-card";
import { useTeamsBuilderState } from "@/app/(authenticated)/partidos/[match-id]/(hooks)/use-team-builder-state";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { type MatchWithPlayers } from "@/types/match";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { type FC, useMemo } from "react";

type MatchDetailsProps = {
  match: MatchWithPlayers;
};

export const MatchDetails: FC<MatchDetailsProps> = ({ match }) => {
  const {
    assignSelectionToTeam,
    balanceTeams,
    createNewTeam,
    randomizeTeams,
    removePlayerFromTeam,
    removeTeam,
    selectedIds,
    teams,
    togglePlayer,
    unselectedPlayers,
    updateTeamName,
  } = useTeamsBuilderState(match);

  /* We consider teams are valid when there is no unselected players AND all teams have a valid name */
  const areTeamsValid = useMemo(() => {
    const validTeamNames = teams.every((team) => Boolean(team.name));

    return !unselectedPlayers.length && validTeamNames;
  }, [teams, unselectedPlayers]);

  /* We check if there is a difference between the local state and the db state */
  const areTeamsSaved = useMemo(() => {
    return match.teams === getTeamsToSave(teams);
  }, [match, teams]);

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <MatchPlayers players={match.players} />
      </div>
      <div className="md:col-span-2">
        {match.players.length ? (
          <div className="space-y-8">
            {unselectedPlayers.length ? (
              <AssignPlayers
                assignSelectionToTeam={assignSelectionToTeam}
                canAssignSelection={!!selectedIds.length}
                players={unselectedPlayers}
                selectedIds={selectedIds}
                teams={teams}
                togglePlayer={togglePlayer}
              />
            ) : null}
            <div className="space-y-4">
              <div className="flex gap-2 items-center justify-between">
                <h1 className="font-bold text-xl">Equipos</h1>
                <div className="space-x-2">
                  <BuildTeams
                    onSave={(preset) => {
                      switch (preset) {
                        case "random": {
                          randomizeTeams();

                          break;
                        }
                        case "balanced": {
                          balanceTeams();

                          break;
                        }
                      }
                    }}
                    showConfirmation={
                      unselectedPlayers.length < match.players.length
                    }
                    showPing={unselectedPlayers.length === match.players.length}
                  />
                  <Button onClick={createNewTeam}>Agregar</Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    canBeDeleted={teams.length > 2}
                    removePlayerFromTeam={removePlayerFromTeam}
                    removeTeam={removeTeam}
                    team={team}
                    updateTeamName={updateTeamName}
                  />
                ))}
              </div>
              <div className="flex gap-2 justify-between">
                <CopyTeams teams={teams} />
                <div className="space-x-2">
                  <SaveTeams
                    disabled={!areTeamsValid}
                    matchId={match.id}
                    teams={teams}
                  />
                  {areTeamsValid && areTeamsSaved ? (
                    <ExportTeams matchId={match.id} />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="font-bold text-xl">
              Sin compañeros ni Messi podría ganar...
            </h1>
            <EmptyState>
              Agrega jugadores al partido para luego empezar a armar los
              equipos.
            </EmptyState>
          </div>
        )}
      </div>
    </div>
  );
};
