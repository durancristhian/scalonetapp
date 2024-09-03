"use server";

import { MatchSchema } from "@/schemas/match";
import {
  addMatch as addMatchQuery,
  deleteMatch as deleteMatchQuery,
  editMatch as editMatchQuery,
} from "@/server/queries/match";
import { Match } from "@prisma/client";
import { revalidatePath } from "next/cache";

type AddMatch = (data: MatchSchema) => Promise<void>;

export const addMatch: AddMatch = async (data) => {
  await addMatchQuery(data);

  revalidatePath("/dashboard");
};

type EditMatch = (
  id: number,
  data: Partial<Match>,
  pathToRevalidate: string
) => Promise<void>;

export const editMatch: EditMatch = async (id, data, pathToRevalidate) => {
  await editMatchQuery(id, data);

  revalidatePath(pathToRevalidate, "page");
};

type DeleteMatch = (id: number) => Promise<void>;

export const deleteMatch: DeleteMatch = async (id) => {
  await deleteMatchQuery(id);

  revalidatePath("/dashboard");
};
