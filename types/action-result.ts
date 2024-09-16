import { ERROR_MESSAGES } from "@/utils/error-messages";

export type ActionResult =
  | {
      ok: true;
      reason?: never;
    }
  | {
      ok: false;
      reason: keyof typeof ERROR_MESSAGES;
    };
