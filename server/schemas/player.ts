import { VALIDATION_MESSAGES } from "@/utils/validation-messages";
import * as z from "zod";

export const PLAYER_SCHEMA = z.object({
  name: z.string().trim().min(1, { message: VALIDATION_MESSAGES.required }),
});
