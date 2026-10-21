import { z } from "zod";
import { ANALYTICS_EVENTS } from "../utils/analytics-events.ts";
import { MAX_PLAYERS_BATCH } from "../utils/player-limits.ts";

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
const exportData = z.object({
  surface: z.enum(["pasto", "natural", "potrero"]),
  weather: z.enum(["none", "rain", "snow"]),
  image_shape: z.enum(["square", "circle", "none"]),
  alignment: z.enum(["left", "center"]),
  has_captain: z.boolean(),
  has_goalkeeper: z.boolean(),
}).strict();
const playersAddedData = z.object({
  method: z.enum(["single", "bulk"]),
  count: z.number().int().min(1).max(MAX_PLAYERS_BATCH),
}).strict().refine(data => data.method !== "single" || data.count === 1);

export const analyticsRequestSchema = z.object({
  type: z.literal("event"),
  payload: z.object({
    website: z.string().uuid(),
    hostname: z.enum(["www.scalonet.app", "scalonet.app"]),
    url: z.enum(["/", "/dashboard", "/partidos", "/partidos/:match"]),
    title: z.enum(["Home", "Dashboard", "Matches", "Team builder"]),
    referrer: z.string().max(253).regex(/^$|^https:\/\/[a-z0-9.-]+\/$/),
    name: z.enum(ANALYTICS_EVENTS).optional(),
    data: z.union([exportData, playersAddedData]).optional(),
  }).strict(),
}).strict().superRefine(({ payload }, context) => {
  const valid = payload.name === "export_download_started"
    // Older open tabs can still send this existing event without properties.
    ? payload.data === undefined || exportData.safeParse(payload.data).success
    : payload.name === "players_added"
      ? playersAddedData.safeParse(payload.data).success
      : payload.data === undefined;
  if (!valid || (payload.data !== undefined && payload.url !== "/partidos/:match")) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["payload", "data"], message: "Invalid event properties." });
  }
});
