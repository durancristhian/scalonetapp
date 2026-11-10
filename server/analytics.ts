import { IMAGE_EXPORT_BACKGROUNDS } from "../utils/image-export-backgrounds.ts";
import {
  IMAGE_EXPORT_AVATARS,
  IMAGE_EXPORT_ALIGNMENTS,
  IMAGE_EXPORT_WEATHERS,
} from "../utils/image-export-options.ts";
import { z } from "zod";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PAGES,
  type AnalyticsPage,
} from "../utils/analytics-events.ts";
import { MAX_PLAYERS_BATCH } from "../utils/player-limits.ts";

export function analyticsWebsiteId(): string | null {
  const id = process.env.UMAMI_WEBSITE_ID;
  return process.env.VERCEL_ENV === "production" &&
    id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ? id
    : null;
}

const exportData = z
  .object({
    surface: z.enum(IMAGE_EXPORT_BACKGROUNDS.map(({ id }) => id)),
    weather: z.enum(IMAGE_EXPORT_WEATHERS.map(({ id }) => id)),
    image_shape: z.enum(IMAGE_EXPORT_AVATARS.map(({ id }) => id)),
    alignment: z.enum(IMAGE_EXPORT_ALIGNMENTS.map(({ id }) => id)),
    has_captain: z.boolean(),
    has_goalkeeper: z.boolean(),
  })
  .strict();
const playersAddedData = z
  .object({
    method: z.enum(["single", "bulk"]),
    count: z.number().int().min(1).max(MAX_PLAYERS_BATCH),
  })
  .strict()
  .refine((data) => data.method !== "single" || data.count === 1);

export const analyticsRequestSchema = z
  .object({
    type: z.literal("event"),
    payload: z
      .object({
        website: z.guid(),
        hostname: z.enum(["www.scalonet.app", "scalonet.app"]),
        url: z.enum(Object.keys(ANALYTICS_PAGES) as AnalyticsPage[]),
        title: z.enum(Object.values(ANALYTICS_PAGES)),
        referrer: z
          .string()
          .max(253)
          .regex(/^$|^https:\/\/[a-z0-9.-]+\/$/),
        name: z.enum(ANALYTICS_EVENTS).optional(),
        data: z.union([exportData, playersAddedData]).optional(),
      })
      .strict(),
  })
  .strict()
  .superRefine(({ payload }, context) => {
    const valid =
      payload.name === "export_download_started"
        ? payload.data === undefined ||
          exportData.safeParse(payload.data).success
        : payload.name === "players_added"
          ? playersAddedData.safeParse(payload.data).success
          : payload.data === undefined;
    if (
      !valid ||
      (payload.data !== undefined && payload.url !== "/partidos/:match")
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payload", "data"],
        message: "Invalid event properties.",
      });
    }
  });
