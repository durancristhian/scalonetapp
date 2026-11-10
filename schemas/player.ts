import { ERROR_MESSAGES } from "@/utils/error-messages";
import { z } from "zod";
import {
  PLAYER_POSITION_IDS,
  MIN_PLAYER_LEVEL,
  MAX_PLAYER_LEVEL,
} from "@/utils/player-options";

export const PLAYER_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.required })
    .max(40, { message: ERROR_MESSAGES.too_large }),
  level: z.number().int().gte(MIN_PLAYER_LEVEL).lte(MAX_PLAYER_LEVEL),
  position: z.enum(PLAYER_POSITION_IDS),
});

export type PlayerSchema = z.infer<typeof PLAYER_SCHEMA>;
