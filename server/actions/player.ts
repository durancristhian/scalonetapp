"use server";

import { PlayerSchema } from "@/schemas/player";
import {
  addMultiplePlayers as addMultiplePlayersQuery,
  addPlayer as addPlayerQuery,
  deletePlayer as deletePlayerQuery,
  editPlayer as editPlayerQuery,
} from "@/server/queries/player";
import { actionClient } from "@/utils/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";

export const addPlayer: (
  matchId: number,
  data: PlayerSchema
) => Promise<void> = async (matchId, data) => {
  await addPlayerQuery(matchId, data);

  revalidatePath("/partidos/[match-id]", "page");
};

export const addMultiplePlayers: (
  matchId: number,
  data: PlayerSchema[]
) => Promise<void> = async (matchId, data) => {
  await addMultiplePlayersQuery(matchId, data);

  revalidatePath("/partidos/[match-id]", "page");
};

export const editPlayer: (
  id: number,
  data: Partial<PlayerSchema>
) => Promise<void> = async (id, data) => {
  await editPlayerQuery(id, data);

  revalidatePath("/partidos/[match-id]", "page");
};

const deletePlayerSchema = zfd.formData({
  id: zfd.numeric(z.number()),
});

export const deletePlayer = actionClient
  .schema(deletePlayerSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    await deletePlayerQuery(id);

    revalidatePath("/partidos/[match-id]", "page");
  });
