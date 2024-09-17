import { ERROR_MESSAGES } from "@/utils/error-messages";
import { z } from "zod";

export const TEAM_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.required })
    .max(40, { message: ERROR_MESSAGES.too_large }),
});

export type TeamSchema = z.infer<typeof TEAM_SCHEMA>;
