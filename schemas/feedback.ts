import { ERROR_MESSAGES } from "@/utils/error-messages";
import { z } from "zod";

export const FEEDBACK_SCHEMA = z.object({
  message: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.required })
    .max(1024, { message: ERROR_MESSAGES.too_large }),
});

export type FeedbackSchema = z.infer<typeof FEEDBACK_SCHEMA>;
