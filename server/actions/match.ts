"use server";

import { MatchSchema } from "@/schemas/match";
import {
  addMatchQuery,
  deleteMatchQuery,
  editMatchQuery,
} from "@/server/queries/match";
import { Match } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type AddMatch = (data: MatchSchema) => Promise<void>;

export const addMatchAction: AddMatch = async (data) => {
  const newMatch = await addMatchQuery(data);

  revalidatePath("/dashboard");

  redirect(`/partidos/${newMatch.id}`);
};

type EditMatch = (
  id: number,
  data: Partial<Match>,
  pathToRevalidate: string
) => Promise<void>;

export const editMatchAction: EditMatch = async (
  id,
  data,
  pathToRevalidate
) => {
  await editMatchQuery(id, data);

  revalidatePath(pathToRevalidate, "page");
};

type DeleteMatch = (id: number) => Promise<void>;

export const deleteMatchAction: DeleteMatch = async (id) => {
  await deleteMatchQuery(id);

  revalidatePath("/dashboard");
};
