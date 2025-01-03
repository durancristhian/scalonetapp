import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import clsx from "clsx";
import type { Metadata, Viewport } from "next";
import { Work_Sans } from "next/font/google";
import { type FC, type PropsWithChildren } from "react";

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

const title = "scalonet.app - ¡Arma equipos como un campeón!";
const description =
  "Tienes lo necesario para ser el Lionel Scaloni entre tus amigos?. Demostrá tu habilidad para formar equipos ideales.";
const ogImagePath = "https://www.scalonet.app/api/og";

export const metadata: Metadata = {
  applicationName: "scalonet.app",
  authors: {
    name: "Cristhian Duran",
    url: "https://github.com/durancristhian",
  },
  creator: "Cristhian Duran",
  description,
  keywords: ["scaloneta", "scalonet.app", "fútbol", "armar equipos de fútbol"],
  openGraph: {
    type: "website",
    url: "https://www.scalonet.app/",
    title,
    description,
    siteName: "scalonet.app",
    images: [
      {
        url: ogImagePath,
      },
    ],
  },
  title,
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@durancristhian",
    images: ogImagePath,
  },
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
            fontFamily.className,
            "antialiased bg-pattern min-h-dvh slashed-zero tabular-nums text-foreground"
          )}
        >
          {children}
          <Toaster gap={8} offset={24} />
        </body>
      </html>
    </ClerkProvider>
  );
};

export default Layout;
