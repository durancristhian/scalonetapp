"use server";

import { MatchSchema } from "@/schemas/match";
import {
  addMatchQuery,
  deleteMatchQuery,
  editMatchQuery,
} from "@/server/queries/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { Match } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const addMatchAction: (data: MatchSchema) => Promise<void> = async (
  data
) => {
  try {
    const { userId } = auth();

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

    await addMatchQuery(data, userId);

    revalidatePath("/dashboard");
  } catch (error) {
    throw new Error(ERROR_MESSAGES.match_add_error);
  }
};

export const editMatchAction: (
  id: number,
  /* TODO: This typing is incorrect since we use this method to update the match.teams and we should use the MatchSchema */
  data: Partial<Match>,
  pathToRevalidate: string
) => Promise<void> = async (id, data, pathToRevalidate) => {
  try {
    const { userId } = auth();

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
    const { userId } = auth();

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
