"use client";

import { trackAnalytics } from "@/utils/analytics";
import { AssignPlayers } from "@/app/(authenticated)/partidos/[match-id]/(components)/assign-players";
import { BuildTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/build-teams";
import { CopyTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/copy-teams";
import { ExportTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/export-teams";
import { MatchPlayers } from "@/app/(authenticated)/partidos/[match-id]/(components)/match-players";
import {
  SaveTeams,
  TeamsValidationAlert,
} from "@/app/(authenticated)/partidos/[match-id]/(components)/save-teams";
import { TeamCard } from "@/app/(authenticated)/partidos/[match-id]/(components)/team-card";
import { useTeamActions } from "@/app/(authenticated)/partidos/[match-id]/(hooks)/use-team-actions";
import { useTeamsBuilderState } from "@/app/(authenticated)/partidos/[match-id]/(hooks)/use-team-builder-state";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { type MatchWithPlayers } from "@/types/match";
import { type FC, useMemo } from "react";
import { TEAMS_PER_MATCH } from "@/utils/team-count";
import { MAX_PLAYERS_PER_MATCH } from "@/utils/player-limits";
import { getSavedTeamsError } from "@/utils/team-validation";

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

  const validationError = useMemo(() => getSavedTeamsError(
    teams.map(team => ({ ...team, players: team.players.map(player => player.id) })),
    match.players.map(player => player.id),
  ), [teams, match.players]);
  const areTeamsValid = !validationError;

  const { operation, save, exportTeams } = useTeamActions(
    match,
    teams,
    areTeamsValid
  );
  const busy = operation !== null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="min-w-0 md:col-span-1">
        <MatchPlayers players={match.players} />
      </div>
      <div className="min-w-0 md:col-span-2">
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
                    disabled={teams.length !== TEAMS_PER_MATCH || match.players.length > MAX_PLAYERS_PER_MATCH}
                    onSave={(preset) => {
                      switch (preset) {
                        case "random": {
                          randomizeTeams();
                          trackAnalytics("teams_randomize_clicked");

                          break;
                        }
                        case "balanced": {
                          balanceTeams();
                          trackAnalytics("teams_balance_clicked");

                          break;
                        }
                      }
                    }}
                    showConfirmation={
                      unselectedPlayers.length < match.players.length
                    }
                    showPing={unselectedPlayers.length === match.players.length}
                  />
                  {teams.length < TEAMS_PER_MATCH ? <Button onClick={createNewTeam}>Agregar</Button> : null}
                </div>
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    canBeDeleted={teams.length > TEAMS_PER_MATCH}
                    removePlayerFromTeam={removePlayerFromTeam}
                    removeTeam={removeTeam}
                    team={team}
                    updateTeamName={updateTeamName}
                  />
                ))}
              </div>
              {validationError ? <TeamsValidationAlert message={validationError} /> : null}
              <div className="flex flex-wrap gap-2 justify-between">
                <CopyTeams teams={teams} />
                <div className="flex flex-wrap gap-2">
                  <SaveTeams
                    disabled={busy || !areTeamsValid}
                    processing={operation === "save"}
                    onSave={save}
                  />
                  <ExportTeams
                    matchId={match.id}
                    name={match.name}
                    teams={teams}
                    disabled={busy || !areTeamsValid}
                    processing={operation === "export"}
                    onExport={exportTeams}
                  />
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
