"use server";

import { MatchSchema } from "@/schemas/match";
import {
  addMatchQuery,
  deleteMatchQuery,
  editMatchQuery,
} from "@/server/queries/match";
import { Match } from "@prisma/client";
import { revalidatePath } from "next/cache";

type AddMatch = (data: MatchSchema) => Promise<void>;

export const addMatchAction: AddMatch = async (data) => {
  await addMatchQuery(data);

  revalidatePath("/dashboard");
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
