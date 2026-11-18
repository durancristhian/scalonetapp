"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { analyticsPage } from "@/utils/analytics-events";
import {
  analyticsExcluded,
  configureAnalytics,
  flushAnalytics,
  trackAnalytics,
} from "@/utils/analytics";

const subscribe = () => () => {};

export function Analytics({ websiteId }: { websiteId: string | null }) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const excluded = useSyncExternalStore(
    subscribe,
    analyticsExcluded,
    () => true,
  );
  const lastPage = useRef<string | null>(null);
  const active =
    !!websiteId &&
    isLoaded &&
    !!analyticsPage(pathname) &&
    !(pathname === "/" && isSignedIn) &&
    !excluded;

  useEffect(
    () => () => {
      configureAnalytics(null);
      lastPage.current = null;
    },
    [],
  );

  useEffect(() => {
    configureAnalytics(active ? websiteId : null);
    if (active && lastPage.current !== pathname) {
      lastPage.current = pathname;
      trackAnalytics();
    }
    if (!active) lastPage.current = null;
  }, [active, pathname, websiteId]);

  if (!active) return null;

  return (
    <Script
      src="/stats/script.js"
      strategy="afterInteractive"
      data-website-id={websiteId!}
      data-host-url="/stats"
      data-auto-track="false"
      data-do-not-track="true"
      data-domains="www.scalonet.app,scalonet.app"
      data-fetch-credentials="omit"
      onReady={flushAnalytics}
    />
  );
}
