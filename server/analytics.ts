import { z } from "zod";
import { ANALYTICS_EVENTS } from "@/utils/analytics-events";

// A production build alone is insufficient: Preview also uses NODE_ENV=production.
export function analyticsWebsiteId(): string | null {
  const id = process.env.UMAMI_WEBSITE_ID;
  return process.env.VERCEL_ENV === "production" &&
    id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ? id
    : null;
}

// Keep the same closed vocabulary at both ends of the first-party collector.
// In particular, no arbitrary properties, account IDs or document titles.
export const analyticsRequestSchema = z.object({
  type: z.literal("event"),
  payload: z.object({
    website: z.string().uuid(),
    hostname: z.enum(["www.scalonet.app", "scalonet.app"]),
    url: z.enum(["/", "/dashboard", "/partidos", "/partidos/:match"]),
    title: z.enum(["Home", "Dashboard", "Matches", "Team builder"]),
    referrer: z.string().max(253).regex(/^$|^https:\/\/[a-z0-9.-]+\/$/),
    name: z.enum(ANALYTICS_EVENTS).optional(),
  }).strict(),
}).strict();
