import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import clsx from "clsx";
import type { Metadata, Viewport } from "next";
import { Work_Sans } from "next/font/google";
import { FC, PropsWithChildren } from "react";

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: "device-width",
};

const fontFamily = Work_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "scalonet.app",
  description: "¡Arma equipos como un campeón!",
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
            fontFamily.className,
            "antialiased bg-background min-h-dvh slashed-zero tabular-nums text-foreground"
          )}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
};

export default Layout;
