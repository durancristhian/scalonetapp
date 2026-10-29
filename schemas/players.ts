import { PLAYER_SCHEMA } from "@/schemas/player";
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
      const names = getLinesFromString(value);
      for (const [index, name] of names.entries()) {
        const result = PLAYER_SCHEMA.shape.name.safeParse(name);
        if (!result.success) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Jugador ${index + 1}: ${result.error.issues[0].message}`,
          });
        }
      }
      const error = getPlayerAdditionError(currentPlayerCount, names.length);
      if (error) context.addIssue({ code: z.ZodIssueCode.custom, message: error });
    }),
});

export type PlayersSchema = z.infer<ReturnType<typeof createPlayersSchema>>;
