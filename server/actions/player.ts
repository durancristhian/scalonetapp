"use server";

import { PLAYER_SCHEMA, type PlayerSchema } from "@/schemas/player";
import { z } from "zod";
import { removeUnusedPhoto } from "@/server/player-photos";
import {
  addMultiplePlayersQuery,
  addPlayerQuery,
  deletePlayerQuery,
  editPlayerQuery,
} from "@/server/queries/player";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { getPlayerAdditionError, MAX_PLAYERS_BATCH } from "@/utils/player-limits";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const PLAYER_ID_SCHEMA = z.number().int().positive().max(2147483647);
class PlayerLimitError extends Error {}

const getMatch = async (matchId: number, userId: string) => {
  return await prisma.match.findFirst({
    where: {
      id: {
        equals: matchId,
      },
      userId: {
        equals: userId,
      },
    },
    include: {
      players: true,
    },
  });
};

const namesInMatch: (
  matchId: number,
  names: string[]
) => Promise<boolean> = async (matchId, names) => {
  const coincidences = await prisma.player.findMany({
    where: {
      matchId: {
        equals: matchId,
      },
      OR: names.map((name) => ({
        name: {
          equals: name,
        },
      })),
    },
  });

  return !!coincidences.length;
};

export const addPlayerAction: (
  matchId: number,
  data: PlayerSchema
) => Promise<number> = async (matchId, data) => {
  try {
    const { userId } = await auth();

    /* We check auth */
    if (!userId) {
      throw new Error(ERROR_MESSAGES.unauthorized);
    }

    const player = PLAYER_SCHEMA.strict().parse(data);

    const match = await getMatch(matchId, userId);

    /* We check the current user owns the match we're trying to add a player to */
    if (!match) {
      throw new Error(ERROR_MESSAGES.not_found);
    }

    const coincidences = await namesInMatch(matchId, [player.name]);

    /* We check that we don't have a player named the same in the match already */
    if (coincidences) {
      throw new Error(ERROR_MESSAGES.match_player_repeated);
    }

    /* We check we don't reach the players in match limit */
    const limitError = getPlayerAdditionError(match.players.length, 1);
    if (limitError) throw new PlayerLimitError(limitError);

    const created = await addPlayerQuery(matchId, player);

    revalidatePath("/partidos/[match-id]", "page");
    return created.id;
  } catch (error) {
    if (error instanceof PlayerLimitError) throw error;
    throw new Error(ERROR_MESSAGES.player_add_error);
  }
};

export const addMultiplePlayersAction: (
  matchId: number,
  data: PlayerSchema[]
) => Promise<void> = async (matchId, data) => {
  try {
    const { userId } = await auth();

    /* We check auth */
    if (!userId) {
      throw new Error(ERROR_MESSAGES.unauthorized);
    }

    const batchError = getPlayerAdditionError(0, data.length);
    if (batchError) throw new PlayerLimitError(batchError);
    const players = z.array(PLAYER_SCHEMA.strict()).min(1).max(MAX_PLAYERS_BATCH).parse(data);

    const match = await getMatch(matchId, userId);

    /* We check the current user owns the match we're trying to add a player to */
    if (!match) {
      throw new Error(ERROR_MESSAGES.not_found);
    }

    const coincidences = await namesInMatch(
      matchId,
      players.map((player) => player.name)
    );

    /* We check that we don't have a player named the same in the match already */
    if (coincidences) {
      throw new Error(ERROR_MESSAGES.match_players_repeated);
    }

    /* We check we don't reach the players in match limit */
    const limitError = getPlayerAdditionError(match.players.length, players.length);
    if (limitError) throw new PlayerLimitError(limitError);

    await addMultiplePlayersQuery(matchId, players);

    revalidatePath("/partidos/[match-id]", "page");
  } catch (error) {
    if (error instanceof PlayerLimitError) throw error;
    throw new Error(ERROR_MESSAGES.player_add_error);
  }
};

export const editPlayerAction: (
  id: number,
  data: PlayerSchema
) => Promise<void> = async (id, data) => {
  try {
    const { userId } = await auth();

    /* We check auth */
    if (!userId) {
      throw new Error(ERROR_MESSAGES.unauthorized);
    }

    const playerId = PLAYER_ID_SCHEMA.parse(id);
    const player = PLAYER_SCHEMA.strict().parse(data);

    await editPlayerQuery(playerId, userId, player);

    revalidatePath("/partidos/[match-id]", "page");
  } catch (error) {
    throw new Error(ERROR_MESSAGES.player_edit_error);
  }
};

export const deletePlayerAction: (id: number) => Promise<void> = async (id) => {
  try {
    const { userId } = await auth();

    /* We check auth */
    if (!userId) {
      throw new Error(ERROR_MESSAGES.unauthorized);
    }

    const playerId = PLAYER_ID_SCHEMA.parse(id);

    const deleted = await deletePlayerQuery(playerId, userId);
    await removeUnusedPhoto(deleted.avatar);

    revalidatePath("/partidos/[match-id]", "page");
  } catch (error) {
    throw new Error(ERROR_MESSAGES.player_delete_error);
  }
};
