"use server";

import { PLAYER_SCHEMA, type PlayerSchema } from "@/schemas/player";
import { z } from "zod";
import { removeUnusedPhoto } from "@/server/player-photos";
import {
  addMultiplePlayersQuery,
  addPlayerQuery,
  deletePlayerQuery,
  editPlayerQuery,
  PlayerAdditionError,
} from "@/server/queries/player";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { MAX_PLAYERS_BATCH } from "@/utils/player-limits";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const PLAYER_ID_SCHEMA = z.number().int().positive().max(2147483647);

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

    const created = await addPlayerQuery(matchId, player, userId);

    revalidatePath("/partidos/[match-id]", "page");
    return created.id;
  } catch (error) {
    if (error instanceof PlayerAdditionError) throw error;
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

    const players = z.array(PLAYER_SCHEMA.strict()).min(1).max(MAX_PLAYERS_BATCH).parse(data);
    await addMultiplePlayersQuery(matchId, players, userId);

    revalidatePath("/partidos/[match-id]", "page");
  } catch (error) {
    if (error instanceof PlayerAdditionError) throw error;
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
