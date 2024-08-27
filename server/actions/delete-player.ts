"use server";

import { deletePlayer as deletePlayerQuery } from "@/server/queries";
import { revalidatePath } from "next/cache";

type DeletePlayer = (id: number) => Promise<void>;

export const deletePlayer: DeletePlayer = async (id) => {
  /* TODO: Do I need some extra checks here? */

  await deletePlayerQuery(id);

  /* TODO: should we receive the URL as a param? */
  revalidatePath("/");
};
