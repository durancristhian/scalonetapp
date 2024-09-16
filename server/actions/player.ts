"use server";

import { PlayerSchema } from "@/schemas/player";
import {
  addMultiplePlayersQuery,
  addPlayerQuery,
  deletePlayerQuery,
  editPlayerQuery,
} from "@/server/queries/player";
import { actionClient } from "@/utils/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";

export const addPlayerAction: (
  matchId: number,
  data: PlayerSchema
) => Promise<void> = async (matchId, data) => {
  await addPlayerQuery(matchId, data);

  revalidatePath("/partidos/[match-id]", "page");
};

export const addMultiplePlayersAction: (
  matchId: number,
  data: PlayerSchema[]
) => Promise<void> = async (matchId, data) => {
  await addMultiplePlayersQuery(matchId, data);

  revalidatePath("/partidos/[match-id]", "page");
};

export const editPlayerAction: (
  id: number,
  data: Partial<PlayerSchema>
) => Promise<void> = async (id, data) => {
  await editPlayerQuery(id, data);

  revalidatePath("/partidos/[match-id]", "page");
};

const deletePlayerSchema = zfd.formData({
  id: zfd.numeric(z.number()),
});

export const deletePlayerAction = actionClient
  .schema(deletePlayerSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    await deletePlayerQuery(id);

    revalidatePath("/partidos/[match-id]", "page");
  });
