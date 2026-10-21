import "@/app/globals.css";
import { Analytics } from "@/components/analytics";
import { analyticsWebsiteId } from "@/server/analytics";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import clsx from "clsx";
import type { Metadata, Viewport } from "next";
import { workSans } from "@/utils/fonts";
import { type FC, type PropsWithChildren } from "react";

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: "device-width",
};

export const metadata: Metadata = {
  applicationName: "Scalonet.app",
  authors: {
    name: "Cristhian Duran",
    url: "https://github.com/durancristhian",
  },
  creator: "Cristhian Duran",
  title: {
    default: "Scalonet.app",
    template: "%s | Scalonet.app",
  },
  // Only public pages explicitly opt into search indexing.
  robots: { index: false, follow: false },
};

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ClerkProvider
      dynamic
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      /* After login we redirect to the dashboard */
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
      /* After logout we redirect to the public landing page */
      afterSignOutUrl="/"
    >
      <html lang="es">
        <body
          className={clsx(
            workSans.className,
            "antialiased bg-pattern min-h-dvh text-base leading-6 slashed-zero tabular-nums text-foreground"
          )}
        >
          {children}
          <Toaster gap={8} offset={24} />
          <Analytics websiteId={analyticsWebsiteId()} />
        </body>
      </html>
    </ClerkProvider>
  );
};

export default Layout;
