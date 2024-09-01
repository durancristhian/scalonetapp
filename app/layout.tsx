import "@/app/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import clsx from "clsx";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { FC, PropsWithChildren } from "react";

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: "device-width",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

/* TODO: Update this information */
export const metadata: Metadata = {
  title: "Scalonet.app",
  description: "Scalonet.app",
};

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ClerkProvider
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
            inter.className,
            "antialiased bg-white slashed-zero tabular-nums text-slate-800"
          )}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
};

export default Layout;
