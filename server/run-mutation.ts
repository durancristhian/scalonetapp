import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import type { ActionResult } from "@/types/action-result";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { ExpectedActionError } from "./expected-action-error";
import { reportServerError } from "./report-error";

type Context = { operation: string; matchId?: number; playerId?: number };

export async function runMutation<T>(context: Context, fallback: string, work: (userId: string) => Promise<T>): Promise<ActionResult<T>> {
  try {
    const { userId } = await auth();
    if (!userId) return { ok: false, error: ERROR_MESSAGES.unauthorized };
    const data = await work(userId);
    // The mutation has committed. A refresh failure must not invite a retry.
    try {
      revalidatePath("/partidos/[match-id]", "page");
      revalidatePath("/dashboard");
      revalidatePath("/partidos");
    } catch (error) { reportServerError(error, { ...context, operation: context.operation + ".revalidate" }); }
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ExpectedActionError) return { ok: false, error: error.message };
    if (error instanceof ZodError) return { ok: false, error: fallback };
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return { ok: false, error: ERROR_MESSAGES.not_found };
    }
    return { ok: false, error: fallback, reference: reportServerError(error, context) };
  }
}
