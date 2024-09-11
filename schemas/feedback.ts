import { VALIDATION_MESSAGES } from "@/utils/validation-messages";
import * as z from "zod";

export const FEEDBACK_SCHEMA = z.object({
  message: z
    .string()
    .trim()
    .min(1, { message: VALIDATION_MESSAGES.required })
    .max(1024, { message: VALIDATION_MESSAGES.too_large }),
});

export type FeedbackSchema = z.infer<typeof FEEDBACK_SCHEMA>;
