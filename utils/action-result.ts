import type { ActionResult } from "@/types/action-result";

export class ActionError extends Error {}

export function unwrapActionResult<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new ActionError(result.error);
  return result.data;
}

export function getActionErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof ActionError ? error.message : fallback;
}
