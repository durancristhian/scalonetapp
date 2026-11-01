"use server";

import { duplicateMatch } from "@/server/duplicate-match";
import { reportServerError } from "@/server/report-error";
import type { DuplicateMatchResult } from "@/types/duplicate-match";
import { removeUnusedPhoto } from "@/server/player-photos";

import {
  MATCH_SCHEMA,
  MATCH_UPDATE_SCHEMA,
  type MatchSchema,
  type MatchUpdateSchema,
} from "@/schemas/match";
import {
  addMatchQuery,
  deleteMatchQuery,
  editMatchQuery,
} from "@/server/queries/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { runMutation } from "@/server/run-mutation";
import { revalidatePath } from "next/cache";

const ID_SCHEMA = z.number().int().positive().max(2147483647);

export const addMatchAction = async (data: MatchSchema) =>
  runMutation(
    { operation: "match.add" },
    ERROR_MESSAGES.match_add_error,
    (userId) => addMatchQuery(MATCH_SCHEMA.parse(data), userId),
  );

export const editMatchAction = async (
  id: number,
  data: MatchUpdateSchema,
  _pathToRevalidate?: string,
) =>
  runMutation(
    { operation: "match.edit", matchId: id },
    ERROR_MESSAGES.match_edit_error,
    async (userId) => {
      await editMatchQuery(
        ID_SCHEMA.parse(id),
        MATCH_UPDATE_SCHEMA.parse(data),
        userId,
      );
    },
  );

export const deleteMatchAction = async (id: number) =>
  runMutation(
    { operation: "match.delete", matchId: id },
    ERROR_MESSAGES.match_delete_error,
    async (userId) => {
      const matchId = ID_SCHEMA.parse(id);
      const photos = await prisma.player.findMany({
        where: { matchId, match: { userId } },
        select: { avatar: true },
      });
      await deleteMatchQuery(matchId, userId);
      await Promise.all(photos.map(({ avatar }) => removeUnusedPhoto(avatar)));
    },
  );

export const duplicateMatchAction = async (
  id: number,
): Promise<DuplicateMatchResult> => {
  let result: DuplicateMatchResult;
  try {
    const { userId } = await auth();
    if (!userId) return { ok: false, code: "unauthorized" };
    if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
      return { ok: false, code: "not_found" };
    }
    result = await duplicateMatch(id, userId);
  } catch (error) {
    const reference = reportServerError(error, {
      operation: "match.duplicate",
      matchId: id,
    });
    return { ok: false, code: "unexpected", reference };
  }

  if (result.ok) {
    try {
      revalidatePath("/dashboard");
      revalidatePath("/partidos");
    } catch (error) {
      reportServerError(error, {
        operation: "match.duplicate.revalidate",
        matchId: id,
      });
    }
  }
  return result;
};
