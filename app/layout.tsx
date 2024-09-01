import { LoggedInContent } from "@/app/(components)/logged-in-content";
import { LoggedOutContent } from "@/app/(components)/logged-out-content";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
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
  title: "scalonet.app",
  description: "scalonet.app",
};

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="es">
        <body
          className={clsx(
            inter.className,
            "antialiased bg-white slashed-zero tabular-nums text-slate-800"
          )}
        >
          <SignedOut>
            <LoggedOutContent />
          </SignedOut>
          <SignedIn>
            <LoggedInContent>{children}</LoggedInContent>
          </SignedIn>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
};

export default Layout;
