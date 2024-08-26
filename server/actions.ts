"use server";

import { revalidatePath } from "next/cache";
import { addPlayer } from "./queries";
import { PLAYER_SCHEMA } from "./schemas";
import { VALIDATION_MESSAGES } from "@/constants/validation-messages";

type ActionState = {
  message: keyof typeof VALIDATION_MESSAGES | null;
};

type AddPlayerAction = (
  prevState: ActionState,
  data: FormData
) => Promise<ActionState>;

export const addPlayerAction: AddPlayerAction = async (
  _prevState,
  formData
) => {
  const data = Object.fromEntries(formData);
  const schemaResult = PLAYER_SCHEMA.safeParse(data);

  if (!schemaResult.success) {
    return {
      message: "invalid_data",
    };
  }

  await addPlayer(schemaResult.data);

  /* TODO: should we receive the URL as a param? */
  revalidatePath("/");

  return {
    message: null,
  };
};
