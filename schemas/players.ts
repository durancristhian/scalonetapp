import { ERROR_MESSAGES } from "@/utils/error-messages";
import { getLinesFromString } from "@/utils/get-lines-from-string";
import { z } from "zod";

export const PLAYERS_SCHEMA = z.object({
  players: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.required })
    .refine(
      (value) =>
        getLinesFromString(value).length <=
        Number(process.env.NEXT_PUBLIC_MAX_PLAYERS_BATCH),
      {
        message: ERROR_MESSAGES.match_max_players_per_batch,
      }
    ),
});

export type PlayersSchema = z.infer<typeof PLAYERS_SCHEMA>;
