import { ERROR_MESSAGES } from "@/utils/error-messages";
import { z } from "zod";

export const PLAYER_SCHEMA = z.object({
  avatar: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.required })
    .max(40, { message: ERROR_MESSAGES.too_large }),
  level: z.number().int().gte(1).lte(10),
  position: z.enum(["goa", "def", "mid", "for"]),
});

export type PlayerSchema = z.infer<typeof PLAYER_SCHEMA>;
