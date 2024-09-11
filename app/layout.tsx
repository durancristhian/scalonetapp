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
            "antialiased min-h-dvh slashed-zero tabular-nums text-foreground",
            /*
              This custom bg color was taken from https://coolors.co/palette/fafaf9-f5f5f4-e7e5e4-d6d3d1-a8a29e-78716c-57534e-44403c-292524-1c1917 This is a color palette we searched based on the --accent color. We were looking for a lighter one.
            */
            "bg-[#fafaf9]"
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
