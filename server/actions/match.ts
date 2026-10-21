"use server";

import { removeUnusedPhoto } from "@/server/player-photos";

import { MATCH_SCHEMA, MATCH_UPDATE_SCHEMA, type MatchSchema, type MatchUpdateSchema } from "@/schemas/match";
import {
  addMatchQuery,
  deleteMatchQuery,
  editMatchQuery,
  getMatchByIdQuery,
} from "@/server/queries/match";
import { addMultiplePlayersQuery } from "@/server/queries/player";
import { type BaseTeam } from "@/types/team";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { type Match } from "@prisma/client";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { getSavedTeamsError } from "@/utils/team-validation";
import { getDuplicatedMatchName } from "@/utils/match-name";
import { MAX_PLAYERS_PER_MATCH } from "@/utils/player-limits";

export const addMatchAction: (
  data: MatchSchema,
  options?: { revalidatePath: boolean }
) => Promise<Match> = async (
  data,
  options = {
    revalidatePath: true,
  }
) => {
  try {
    const { userId } = await auth();

    /* We check auth */
    if (!userId) {
      throw new Error(ERROR_MESSAGES.unauthorized);
    }

    const matchData = MATCH_SCHEMA.parse(data);
    const userMatches = await prisma.match.findMany({
      where: {
        userId: {
          equals: userId,
        },
      },
    });

    /* We check the user hasn't reached the limit of matches they can create */
    if (
      userMatches.length >= Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER)
    ) {
      throw new Error(ERROR_MESSAGES.match_limit_reached);
    }

    const sameNameMatch = userMatches.find(
      (userMatch) => userMatch.name === matchData.name
    );

    /* We check we don't have a match named the same */
    if (sameNameMatch) {
      throw new Error(ERROR_MESSAGES.match_name_repeated);
    }

    const newMatch = await addMatchQuery(matchData, userId);

    if (options.revalidatePath) {
      revalidatePath("/dashboard");
    }

    return newMatch;
  } catch (error) {
    throw new Error(ERROR_MESSAGES.match_add_error);
  }
};

export const editMatchAction: (
  id: number,
  data: MatchUpdateSchema,
  pathToRevalidate: string
) => Promise<void> = async (id, data, pathToRevalidate) => {
  try {
    const { userId } = await auth();

    /* We check auth */
    if (!userId) {
      throw new Error(ERROR_MESSAGES.unauthorized);
    }

    const matchData = MATCH_UPDATE_SCHEMA.parse(data);
    /* A rename may keep its existing name, but cannot reuse another match's. */
    if (matchData.name !== undefined) {
      const sameNameMatch = await prisma.match.findFirst({
        where: {
          userId: {
            equals: userId,
          },
          name: matchData.name,
          id: { not: id },
        },
      });

      if (sameNameMatch) {
        throw new Error(ERROR_MESSAGES.match_name_repeated);
      }
    }

    await editMatchQuery(id, matchData, userId);

    revalidatePath(pathToRevalidate, "page");
  } catch (error) {
    throw new Error(ERROR_MESSAGES.match_edit_error);
  }
};

export const deleteMatchAction: (id: number) => Promise<void> = async (id) => {
  try {
    const { userId } = await auth();

    /* We check auth */
    if (!userId) {
      throw new Error(ERROR_MESSAGES.unauthorized);
    }

    const photos = await prisma.player.findMany({ where: { matchId: id, match: { userId } }, select: { avatar: true } });
    await deleteMatchQuery(id, userId);
    await Promise.all(photos.map(({ avatar }) => removeUnusedPhoto(avatar)));

    revalidatePath("/dashboard");
  } catch (error) {
    throw new Error(ERROR_MESSAGES.match_delete_error);
  }
};

export const duplicateMatchAction: (id: number) => Promise<void> = async (
  id
) => {
  try {
    const { userId } = await auth();

    /* We check auth */
    if (!userId) {
      throw new Error(ERROR_MESSAGES.unauthorized);
    }

    const existingMatch = await getMatchByIdQuery(id);

    if (!existingMatch) {
      throw new Error(ERROR_MESSAGES.not_found);
    }
    if (existingMatch.players.length > MAX_PLAYERS_PER_MATCH) {
      throw new Error("El partido supera el máximo de jugadores permitido.");
    }

    const existingTeams: BaseTeam[] = JSON.parse(existingMatch.teams);
    if (existingTeams.length) {
      const error = getSavedTeamsError(existingTeams, existingMatch.players.map(player => player.id));
      if (error) throw new Error(error);
    }

    /* We create a new match */
    const newMatch = await addMatchAction(
      {
        name: getDuplicatedMatchName(existingMatch.name, format(new Date(), "t")),
      },
      { revalidatePath: false }
    );

    if (existingMatch.players.length) {
      /* We add the existing players to the new match as well */
      await addMultiplePlayersQuery(
        newMatch.id,
        existingMatch.players.map(({ name, level, position }) => ({
          name,
          level,
          position,
        })),
        userId,
      );

      const updatedNewMatch = await getMatchByIdQuery(newMatch.id);

      if (!updatedNewMatch) {
        throw new Error(ERROR_MESSAGES.not_found);
      }

      if (existingTeams.length) {
        /* We create a map to get the recently created player id based on the existing one */
        const existingPlayersMap: Record<number, number> =
          existingMatch.players.reduce(
            (acc, curr) => ({
              ...acc,
              [curr.id]: updatedNewMatch.players.find(
                (player) => player.name === curr.name
                /* It's safe to use ? here since we just duplicated the players and names should match */
              )?.id,
            }),
            {}
          );

        /* We iterate over the existing teams and we replace the ids */
        const parsedTeams: BaseTeam[] = JSON.parse(existingMatch.teams);
        const nextTeams: BaseTeam[] = parsedTeams.map((team) => ({
          ...team,
          players: team.players
            .map((playerId) => existingPlayersMap[playerId])
            .filter((id): id is number => id !== undefined),
        }));

        /* We edit the match so we copy the same teams */
        await editMatchQuery(
          newMatch.id,
          { teams: JSON.stringify(nextTeams) },
          userId
        );
      }
    }

    revalidatePath("/dashboard");
  } catch (error) {
    throw new Error(ERROR_MESSAGES.match_duplicate_error);
  }
};
