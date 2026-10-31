"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { analyticsPage } from "@/utils/analytics-events";
import {
  analyticsExcluded,
  configureAnalytics,
  flushAnalytics,
  trackAnalytics,
} from "@/utils/analytics";

export function Analytics({ websiteId }: { websiteId: string | null }) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const lastPage = useRef<string | null>(null);
  const eligible =
    !!websiteId &&
    isLoaded &&
    !!analyticsPage(pathname) &&
    !(pathname === "/" && isSignedIn);

  useEffect(
    () => () => {
      configureAnalytics(null);
      lastPage.current = null;
    },
    [],
  );

  useEffect(() => {
    const active = eligible && !analyticsExcluded();
    configureAnalytics(active ? websiteId : null);
    setEnabled(active);
    if (active && lastPage.current !== pathname) {
      lastPage.current = pathname;
      trackAnalytics();
    }
    if (!active) lastPage.current = null;
  }, [eligible, pathname, websiteId]);

  if (!enabled || !eligible) return null;

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
