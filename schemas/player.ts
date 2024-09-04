import { VALIDATION_MESSAGES } from "@/utils/validation-messages";
import * as z from "zod";

export const PLAYER_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: VALIDATION_MESSAGES.required })
    .max(40, { message: VALIDATION_MESSAGES.too_large }),
  level: z.number().int().gte(1).lte(10),
});

export type PlayerSchema = z.infer<typeof PLAYER_SCHEMA>;
