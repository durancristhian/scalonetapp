import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import clsx from "clsx";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

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

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
