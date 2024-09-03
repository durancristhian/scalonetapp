"use server";

import { PlayerSchema } from "@/schemas/player";
import {
  addMultiplePlayers as addMultiplePlayersQuery,
  addPlayer as addPlayerQuery,
  deletePlayer as deletePlayerQuery,
} from "@/server/queries/player";
import { revalidatePath } from "next/cache";

type AddPlayer = (data: PlayerSchema, matchId: number) => Promise<void>;

export const addPlayer: AddPlayer = async (data, matchId) => {
  await addPlayerQuery(data, matchId);

  revalidatePath("/matches/[match-id]", "page");
};

type AddMultiplePlayers = (
  data: PlayerSchema[],
  matchId: number
) => Promise<void>;

export const addMultiplePlayers: AddMultiplePlayers = async (data, matchId) => {
  await addMultiplePlayersQuery(data, matchId);

  revalidatePath("/matches/[match-id]", "page");
};

type DeletePlayer = (id: number) => Promise<void>;

export const deletePlayer: DeletePlayer = async (id) => {
  await deletePlayerQuery(id);

  revalidatePath("/matches/[match-id]", "page");
};
