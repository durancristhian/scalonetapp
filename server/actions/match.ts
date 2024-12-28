"use server";

import { type MatchSchema } from "@/schemas/match";
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
      (userMatch) => userMatch.name === data.name
    );

    /* We check we don't have a match named the same */
    if (sameNameMatch) {
      throw new Error(ERROR_MESSAGES.match_name_repeated);
    }

    const newMatch = await addMatchQuery(data, userId);

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
  data: Partial<Match>,
  pathToRevalidate: string
) => Promise<void> = async (id, data, pathToRevalidate) => {
  try {
    const { userId } = await auth();

    /* We check auth */
    if (!userId) {
      throw new Error(ERROR_MESSAGES.unauthorized);
    }

    /* We check we don't have a match named the same ONLY IF we're getting a name as part of the data to be updated */
    if (data.name) {
      const sameNameMatch = await prisma.match.findFirst({
        where: {
          userId: {
            equals: userId,
          },
          name: {
            equals: data.name,
          },
        },
      });

      if (sameNameMatch) {
        throw new Error(ERROR_MESSAGES.match_name_repeated);
      }
    }

    await editMatchQuery(id, data, userId);

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

    await deleteMatchQuery(id, userId);

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

    /* We create a new match */
    const newMatch = await addMatchAction(
      {
        name: `Copia de ${existingMatch.name} (${format(new Date(), "t")})`,
      },
      { revalidatePath: false }
    );

    if (existingMatch.players.length) {
      /* We add the existing players to the new match as well */
      await addMultiplePlayersQuery(
        newMatch.id,
        existingMatch.players.map(({ name, level, position, avatar }) => ({
          name,
          level,
          position,
          avatar,
        }))
      );

      const updatedNewMatch = await getMatchByIdQuery(newMatch.id);

      if (!updatedNewMatch) {
        throw new Error(ERROR_MESSAGES.not_found);
      }

      if (existingMatch.teams) {
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
