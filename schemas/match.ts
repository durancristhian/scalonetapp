import { ERROR_MESSAGES } from "@/utils/error-messages";
import { z } from "zod";

export const MATCH_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.required })
    .max(40, { message: ERROR_MESSAGES.too_large }),
});

export type MatchSchema = z.infer<typeof MATCH_SCHEMA>;
