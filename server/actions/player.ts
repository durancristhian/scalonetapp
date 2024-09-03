"use server";

import { PlayerSchema } from "@/schemas/player";
import {
  addMultiplePlayers as addMultiplePlayersQuery,
  addPlayer as addPlayerQuery,
  deletePlayer as deletePlayerQuery,
  editPlayer as editPlayerQuery,
} from "@/server/queries/player";
import { revalidatePath } from "next/cache";

export const addPlayer: (
  matchId: number,
  data: PlayerSchema
) => Promise<void> = async (matchId, data) => {
  await addPlayerQuery(matchId, data);

  revalidatePath("/matches/[match-id]", "page");
};

export const addMultiplePlayers: (
  matchId: number,
  data: PlayerSchema[]
) => Promise<void> = async (matchId, data) => {
  await addMultiplePlayersQuery(matchId, data);

  revalidatePath("/matches/[match-id]", "page");
};

export const editPlayer: (
  id: number,
  data: Partial<PlayerSchema>
) => Promise<void> = async (id, data) => {
  await editPlayerQuery(id, data);

  revalidatePath("/matches/[match-id]", "page");
};

export const deletePlayer: (id: number) => Promise<void> = async (id) => {
  await deletePlayerQuery(id);

  revalidatePath("/matches/[match-id]", "page");
};
