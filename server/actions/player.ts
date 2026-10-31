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
import { MAX_PLAYERS_BATCH } from "@/utils/player-limits";
import { runMutation } from "@/server/run-mutation";

const ID_SCHEMA = z.number().int().positive().max(2147483647);

export const addPlayerAction = async (matchId: number, data: PlayerSchema) =>
  runMutation(
    { operation: "player.add", matchId },
    ERROR_MESSAGES.player_add_error,
    async (userId) => {
      const created = await addPlayerQuery(
        ID_SCHEMA.parse(matchId),
        PLAYER_SCHEMA.strict().parse(data),
        userId,
      );
      return created.id;
    },
  );

export const addMultiplePlayersAction = async (
  matchId: number,
  data: PlayerSchema[],
) =>
  runMutation(
    { operation: "player.add_multiple", matchId },
    ERROR_MESSAGES.player_multiple_add_error,
    async (userId) => {
      await addMultiplePlayersQuery(
        ID_SCHEMA.parse(matchId),
        z
          .array(PLAYER_SCHEMA.strict())
          .min(1)
          .max(MAX_PLAYERS_BATCH)
          .parse(data),
        userId,
      );
    },
  );

export const editPlayerAction = async (id: number, data: PlayerSchema) =>
  runMutation(
    { operation: "player.edit", playerId: id },
    ERROR_MESSAGES.player_edit_error,
    async (userId) => {
      await editPlayerQuery(
        ID_SCHEMA.parse(id),
        userId,
        PLAYER_SCHEMA.strict().parse(data),
      );
    },
  );

export const deletePlayerAction = async (id: number) =>
  runMutation(
    { operation: "player.delete", playerId: id },
    ERROR_MESSAGES.player_delete_error,
    async (userId) => {
      const deleted = await deletePlayerQuery(ID_SCHEMA.parse(id), userId);
      await removeUnusedPhoto(deleted.avatar);
    },
  );
