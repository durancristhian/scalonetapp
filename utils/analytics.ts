"use client";

import { ANALYTICS_PAGES, analyticsPage, type AnalyticsData, type AnalyticsEvent, type AnalyticsPayload, type ExportAnalyticsData, type PlayersAddedAnalyticsData } from "./analytics-events.ts";

declare global {
  interface Window {
    umami?: { track: (payload: AnalyticsPayload) => Promise<unknown> };
  }
}

let website: string | null = null;
const pending: AnalyticsPayload[] = [];

export function analyticsExcluded(): boolean {
  try {
    return navigator.doNotTrack === "1" || navigator.doNotTrack === "yes" ||
      !!localStorage.getItem("umami.disabled");
  } catch {
    // If browser privacy settings deny storage, omit analytics.
    return true;
  }
}

export function configureAnalytics(id: string | null) {
  website = id;
  if (!id) pending.length = 0;
}

export function flushAnalytics() {
  if (!website || analyticsExcluded()) {
    pending.length = 0;
    return;
  }
  if (!window.umami) return;
  for (const payload of pending.splice(0)) {
    try {
      // Object form deliberately avoids Umami's automatic URL/title/referrer defaults.
      void Promise.resolve(window.umami.track(payload)).catch(() => {});
    } catch {
      // Tracking must never affect the operation being measured.
    }
  }
}

export function trackAnalytics(name?: Exclude<AnalyticsEvent, "export_download_started" | "players_added">): void;
export function trackAnalytics(name: "export_download_started", data: ExportAnalyticsData): void;
export function trackAnalytics(name: "players_added", data: PlayersAddedAnalyticsData): void;
export function trackAnalytics(name?: AnalyticsEvent, data?: AnalyticsData) {
  try {
    if (!website || analyticsExcluded()) return;
    const url = analyticsPage(window.location.pathname);
    const hostname = window.location.hostname;
    if (!url || (hostname !== "www.scalonet.app" && hostname !== "scalonet.app")) return;
    let referrer = "";
    if (document.referrer) {
      const source = new URL(document.referrer);
      if (source.hostname !== "www.scalonet.app" && source.hostname !== "scalonet.app") {
        // Discovery source only, never the referring path, query or fragment.
        referrer = `https://${source.hostname}/`;
      }
    }
    if (pending.length < 20) pending.push({
      website, hostname, url, title: ANALYTICS_PAGES[url], referrer,
      ...(name ? { name } : {}),
      ...(data ? { data: { ...data } } : {}),
    });
    flushAnalytics();
  } catch {
    // Analytics is best effort, including malformed browser metadata.
  }
}
