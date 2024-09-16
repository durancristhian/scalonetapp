"use client";

import { BuildTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/build-teams";
import { CopyTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/copy-teams";
import { ExportTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/export-teams";
import { MatchPlayers } from "@/app/(authenticated)/partidos/[match-id]/(components)/match-players";
import { PlayersList } from "@/app/(authenticated)/partidos/[match-id]/(components)/players-list";
import { SaveTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/save-teams";
import { TeamCard } from "@/app/(authenticated)/partidos/[match-id]/(components)/team-card";
import { useTeamsBuilderState } from "@/app/(authenticated)/partidos/[match-id]/(hooks)/use-team-builder-state";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MatchWithPlayers } from "@/types/match";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { FC, useMemo } from "react";

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
        <div className="space-y-4">
          {match.players.length ? (
            <>
              <h1 className="font-bold text-xl">
                {unselectedPlayers.length
                  ? "¡Es hora de armar los equipos!"
                  : "¡Terminaste!"}
              </h1>
              {unselectedPlayers.length ? (
                <>
                  <PlayersList
                    assignSelectionToTeam={assignSelectionToTeam}
                    canAssignSelection={!selectedIds.length}
                    players={unselectedPlayers}
                    selectedIds={selectedIds}
                    teams={teams}
                    togglePlayer={togglePlayer}
                  />
                  <Separator />
                </>
              ) : null}
              <div className="space-y-4">
                <div className="flex gap-2 items-center justify-between">
                  <p className="font-semibold">Los equipos</p>
                  <div className="space-x-2">
                    <BuildTeams
                      disableBalanceTeams={match.players.every(
                        (player) =>
                          player.level ===
                          Number(process.env.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL)
                      )}
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
                <div className="text-right">
                  <CopyTeams
                    disabled={unselectedPlayers.length === match.players.length}
                    teams={teams}
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-center">
                <p className="font-semibold">¿Listo para la acción?</p>
                <div className="flex gap-2 items-center justify-center">
                  <SaveTeams
                    disabled={!areTeamsValid}
                    matchId={match.id}
                    teams={teams}
                  />
                  <ExportTeams
                    disabled={!areTeamsValid || !areTeamsSaved}
                    matchId={match.id}
                    teams={teams}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <h1 className="font-bold text-xl">
                Sin jugadores, ni Messi podría ganar...
              </h1>
              <EmptyState>
                Convoca a tus cracks para que esto no sea un solitario. ¡No se
                puede armar el picadito con fantasmas!
              </EmptyState>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
