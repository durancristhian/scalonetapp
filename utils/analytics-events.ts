import type { ImageExportOptions } from "./image-export-options.ts";

export const ANALYTICS_PAGES = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/partidos": "Matches",
  "/partidos/:match": "Team builder",
} as const;

export const ANALYTICS_EVENTS = [
  "sign_in_clicked",
  "match_create_opened",
  "match_created",
  "match_duplicated",
  "teams_randomize_clicked",
  "teams_balance_clicked",
  "teams_saved",
  "export_opened",
  "export_requested",
  "export_download_started",
  "export_save_failed",
  "export_image_failed",
  "players_added",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];
export type AnalyticsPage = keyof typeof ANALYTICS_PAGES;
export type ExportAnalyticsData = {
  surface: ImageExportOptions["background"];
  weather: ImageExportOptions["weather"];
  image_shape: ImageExportOptions["avatarShape"];
  alignment: ImageExportOptions["alignment"];
  has_captain: boolean;
  has_goalkeeper: boolean;
};
export type PlayersAddedAnalyticsData = { method: "single" | "bulk"; count: number };
export type AnalyticsData = ExportAnalyticsData | PlayersAddedAnalyticsData;

export function analyticsPage(pathname: string): AnalyticsPage | null {
  if (/^\/partidos\/\d+\/?$/.test(pathname)) return "/partidos/:match";
  if (Object.hasOwn(ANALYTICS_PAGES, pathname)) return pathname as AnalyticsPage;
  return null;
}

export type AnalyticsPayload = {
  website: string;
  hostname: "www.scalonet.app" | "scalonet.app";
  url: AnalyticsPage;
  title: (typeof ANALYTICS_PAGES)[AnalyticsPage];
  referrer: string;
  name?: AnalyticsEvent;
  data?: AnalyticsData;
};
