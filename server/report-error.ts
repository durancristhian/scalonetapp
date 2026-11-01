import { randomUUID } from "node:crypto";

export function reportServerError(
  error: unknown,
  context: { operation: string; matchId?: number; playerId?: number },
): string {
  const reference = randomUUID().replaceAll("-", "").slice(0, 12);
  console.error(
    "[server-action-error]",
    {
      ...context,
      reference,
      release: process.env.VERCEL_GIT_COMMIT_SHA,
    },
    error,
  );
  return reference;
}
