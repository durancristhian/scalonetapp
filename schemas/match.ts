import { ERROR_MESSAGES } from "../utils/error-messages.ts";
import { MAX_MATCH_NAME_LENGTH } from "../utils/match-name.ts";
import { z } from "zod";

export const MATCH_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.required })
    .max(MAX_MATCH_NAME_LENGTH, { message: ERROR_MESSAGES.too_large }),
}).strict();

export const MATCH_UPDATE_SCHEMA = MATCH_SCHEMA.partial().extend({
  teams: z.string().optional(),
  expectedTeams: z.string().optional(),
}).refine(data => data.teams === undefined || data.expectedTeams !== undefined);

export type MatchSchema = z.infer<typeof MATCH_SCHEMA>;
export type MatchUpdateSchema = z.infer<typeof MATCH_UPDATE_SCHEMA>;
