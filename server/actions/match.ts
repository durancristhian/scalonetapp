"use server";

import { duplicateMatch } from "@/server/duplicate-match";
import { reportServerError } from "@/server/report-error";
import type { DuplicateMatchResult } from "@/types/duplicate-match";
import { removeUnusedPhoto } from "@/server/player-photos";

import { MATCH_SCHEMA, MATCH_UPDATE_SCHEMA, type MatchSchema, type MatchUpdateSchema } from "@/schemas/match";
import {
  addMatchQuery,
  deleteMatchQuery,
  editMatchQuery,
} from "@/server/queries/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { type Match } from "@prisma/client";
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

export const duplicateMatchAction = async (id: number): Promise<DuplicateMatchResult> => {
  let result: DuplicateMatchResult;
  try {
    const { userId } = await auth();
    if (!userId) return { ok: false, code: "unauthorized" };
    if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
      return { ok: false, code: "not_found" };
    }
    result = await duplicateMatch(id, userId);
  } catch (error) {
    const reference = reportServerError(error, { operation: "match.duplicate", matchId: id });
    return { ok: false, code: "unexpected", reference };
  }

  if (result.ok) {
    try {
      revalidatePath("/dashboard");
      revalidatePath("/partidos");
    } catch (error) {
      // The copy already committed. Don't invite a second copy because refresh failed.
      reportServerError(error, { operation: "match.duplicate.revalidate", matchId: id });
    }
  }
  return result;
};
