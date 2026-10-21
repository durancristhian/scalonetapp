import { ERROR_MESSAGES } from "@/utils/error-messages";
import { getLinesFromString } from "@/utils/get-lines-from-string";
import { getPlayerAdditionError } from "@/utils/player-limits";
import { z } from "zod";

export const createPlayersSchema = (currentPlayerCount: number) => z.object({
  players: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.required })
    .superRefine((value, context) => {
      const error = getPlayerAdditionError(currentPlayerCount, getLinesFromString(value).length);
      if (error) context.addIssue({ code: z.ZodIssueCode.custom, message: error });
    }),
});

export type PlayersSchema = z.infer<ReturnType<typeof createPlayersSchema>>;
