import { VALIDATION_MESSAGES } from "@/utils/validation-messages";
import { z } from "zod";

export const MATCH_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: VALIDATION_MESSAGES.required })
    .max(40, { message: VALIDATION_MESSAGES.too_large }),
});

export type MatchSchema = z.infer<typeof MATCH_SCHEMA>;
