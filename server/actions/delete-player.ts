"use server";

import { revalidatePath } from "next/cache";
import { deletePlayer as deletePlayerQuery } from "../queries";

type DeletePlayer = (id: number) => Promise<void>;

export const deletePlayer: DeletePlayer = async (id) => {
  /* TODO: Do I need some extra checks here? */

  await deletePlayerQuery(id);

  /* TODO: should we receive the URL as a param? */
  revalidatePath("/");
};
