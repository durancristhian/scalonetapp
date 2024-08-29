"use client";

import { PlayersInMatchLabel } from "@/app/matches/(components)/players-in-match-label";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/cn";
import { Player } from "@prisma/client";
import uniqueId from "lodash.uniqueid";
import { Check, TrashIcon } from "lucide-react";
import { FC, useState } from "react";

type Team = {
  id: string;
  name: string;
  players: Player[];
};

type TeamsBuilderProps = {
  players: Player[];
};

export const TeamsBuilder: FC<TeamsBuilderProps> = ({ players }) => {
  const [teams, setTeams] = useState<Team[]>([
    { id: uniqueId("team-"), name: "Equipo 1", players: [] },
    { id: uniqueId("team-"), name: "Equipo 2", players: [] },
  ]);

  const updateTeams: (player: Player, teamId: string) => void = (
    player,
    teamId
  ) => {
    setTeams((currTeams) => {
      /* We create a copy of the current state so we can mutate it */
      const currTeamsCopy = [...currTeams];

      const nextTeams = currTeamsCopy.map((team) => {
        const playerInTeamIdx = team.players.findIndex(
          (teamPlayer) => teamPlayer.id === player.id
        );

        if (playerInTeamIdx >= 0) {
          team.players = team.players.splice(playerInTeamIdx, 1);
        } else if (team.id === teamId) {
          team.players.push(player);
        }

        return team;
      });

      return nextTeams;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>A lo que vinimos</CardTitle>
        <CardDescription>Vamos a armar los equipos de una vez.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {teams.map((team) => (
            <div key={team.id} className="grow">
              <TeamBuilder
                team={team}
                players={players}
                updateTeams={updateTeams}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

type TeamBuilderProps = {
  players: Player[];
  team: Team;
  updateTeams: (player: Player, teamId: string) => void;
};

const TeamBuilder: FC<TeamBuilderProps> = ({ players, team, updateTeams }) => {
  const [open, setOpen] = useState(false);

  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
        <CardDescription>
          <PlayersInMatchLabel players={team.players.length} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grow">
            {team.players.length ? (
              <ul className="flex flex-col gap-4">
                {team.players.map((teamPlayer) => (
                  <li key={teamPlayer.id}>
                    <div className="border border-slate-300 flex items-center gap-4 p-2 rounded-md">
                      <div className="inline-flex">
                        <Avatar name={teamPlayer.name} size={36} />
                      </div>
                      <div className="grow">
                        <p className="font-semibold">{teamPlayer.name}</p>
                      </div>
                      <div className="inline-flex">
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            updateTeams(teamPlayer, team.id);
                          }}
                        >
                          <TrashIcon className="h-4 text-red-700 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="self-center">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button role="combobox" aria-expanded={open}>
                  Gestionar equipo
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Buscar por nombre..." />
                  <CommandList>
                    <CommandEmpty>
                      <div className="px-2">
                        Mmm, no hay nadie que se llame así, che...
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {players.map((player) => (
                        <CommandItem
                          key={player.id}
                          value={`${player.id}`}
                          onSelect={() => {
                            updateTeams(player, team.id);
                          }}
                        >
                          <Check
                            className={cn(
                              "h-4 mr-2 w-4",
                              team.players.findIndex(
                                (teamPlayer) => teamPlayer.id === player.id
                              ) >= 0
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {player.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
