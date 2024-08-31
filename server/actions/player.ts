"use server";

import {
  addPlayer as addPlayerQuery,
  deletePlayer as deletePlayerQuery,
} from "@/server/queries/player";
import { PlayerSchema } from "@/server/schemas/player";
import { revalidatePath } from "next/cache";

type AddPlayer = (data: PlayerSchema, matchId: number) => Promise<void>;

export const addPlayer: AddPlayer = async (data, matchId) => {
  await addPlayerQuery(data, matchId);

  revalidatePath("/[match-id]", "page");
};

type DeletePlayer = (id: number) => Promise<void>;

export const deletePlayer: DeletePlayer = async (id) => {
  await deletePlayerQuery(id);

  revalidatePath("/[match-id]", "page");
};
