import { ERROR_MESSAGES, getTooLargeMessage } from "@/utils/error-messages";
import { z } from "zod";
import { MAX_TEAM_NAME_LENGTH } from "@/utils/team-validation";

export const TEAM_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.required })
    .max(MAX_TEAM_NAME_LENGTH, {
      message: getTooLargeMessage(MAX_TEAM_NAME_LENGTH),
    }),
});

export type TeamSchema = z.infer<typeof TEAM_SCHEMA>;
