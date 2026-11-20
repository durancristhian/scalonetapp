import { ERROR_MESSAGES, getTooLargeMessage } from "@/utils/error-messages";
import { z } from "zod";

const MAX_FEEDBACK_LENGTH = 1024;

export const FEEDBACK_SCHEMA = z.object({
  message: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.required })
    .max(MAX_FEEDBACK_LENGTH, {
      message: getTooLargeMessage(MAX_FEEDBACK_LENGTH),
    }),
});

export type FeedbackSchema = z.infer<typeof FEEDBACK_SCHEMA>;
