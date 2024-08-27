"use server";

import { revalidatePath } from "next/cache";
import { addPlayer as addPlayerQuery } from "../queries";
import { PLAYER_SCHEMA } from "../schemas";
import { VALIDATION_MESSAGES } from "@/constants/validation-messages";

type ActionState = {
  message: keyof typeof VALIDATION_MESSAGES | null;
};

type AddPlayer = (
  prevState: ActionState,
  data: FormData
) => Promise<ActionState>;

export const addPlayer: AddPlayer = async (_prevState, formData) => {
  const data = Object.fromEntries(formData);
  const schemaResult = PLAYER_SCHEMA.safeParse(data);

  if (!schemaResult.success) {
    return {
      message: "invalid_data",
    };
  }

  /* TODO: check we can actually create a player and the match is not full */

  await addPlayerQuery(schemaResult.data);

  /* TODO: should we receive the URL as a param? */
  revalidatePath("/");

  return {
    message: null,
  };
};
