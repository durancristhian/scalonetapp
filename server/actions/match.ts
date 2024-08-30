"use server";

import {
  addMatch as addMatchQuery,
  deleteMatch as deleteMatchQuery,
} from "@/server/queries/match";
import { MatchSchema } from "@/server/schemas/match";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type AddMatch = (data: MatchSchema) => Promise<void>;

export const addMatch: AddMatch = async (data) => {
  await addMatchQuery(data);

  revalidatePath("/matches");
  redirect("/matches");
};

type DeleteMatch = (id: number) => Promise<void>;

export const deleteMatch: DeleteMatch = async (id) => {
  await deleteMatchQuery(id);

  revalidatePath("/matches");
};