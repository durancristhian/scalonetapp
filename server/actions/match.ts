"use server";

import { MatchSchema } from "@/schemas/match";
import {
  addMatch as addMatchQuery,
  deleteMatch as deleteMatchQuery,
  editMatch as editMatchQuery,
} from "@/server/queries/match";
import { revalidatePath } from "next/cache";

type AddMatch = (data: MatchSchema) => Promise<void>;

export const addMatch: AddMatch = async (data) => {
  await addMatchQuery(data);

  revalidatePath("/dashboard");
};

type EditMatch = (matchId: number, data: MatchSchema) => Promise<void>;

export const editMatch: EditMatch = async (matchId, data) => {
  await editMatchQuery(matchId, data);

  revalidatePath("/dashboard");
};

type DeleteMatch = (id: number) => Promise<void>;

export const deleteMatch: DeleteMatch = async (id) => {
  await deleteMatchQuery(id);

  revalidatePath("/dashboard");
};
