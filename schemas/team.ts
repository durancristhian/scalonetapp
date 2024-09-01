import { VALIDATION_MESSAGES } from "@/utils/validation-messages";
import * as z from "zod";

export const TEAM_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: VALIDATION_MESSAGES.required })
    .max(40, { message: VALIDATION_MESSAGES.too_large }),
});

export type TeamSchema = z.infer<typeof TEAM_SCHEMA>;
