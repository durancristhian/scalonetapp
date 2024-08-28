"use server";

import { addMatch as addMatchQuery } from "@/server/queries/matches";
import { MatchSchema } from "@/server/schemas/match";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type AddMatch = (data: MatchSchema) => Promise<void>;

export const addMatch: AddMatch = async (data) => {
  await addMatchQuery(data);

  revalidatePath("/matches");
  redirect("/matches");
};
