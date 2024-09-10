import { getLinesFromString } from "@/utils/get-lines-from-string";
import { VALIDATION_MESSAGES } from "@/utils/validation-messages";
import * as z from "zod";

export const PLAYERS_SCHEMA = z.object({
  players: z
    .string()
    .trim()
    .min(1, { message: VALIDATION_MESSAGES.required })
    .refine(
      (value) =>
        getLinesFromString(value).length <=
        Number(process.env.NEXT_PUBLIC_MAX_PLAYERS_BATCH),
      {
        message: VALIDATION_MESSAGES.max_players_per_save,
      }
    ),
});

export type PlayersSchema = z.infer<typeof PLAYERS_SCHEMA>;
