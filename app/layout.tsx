import "@/app/globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ShowOff } from "@/components/show-off";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";
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
          <SignedOut>
            <LoggedOutContent />
          </SignedOut>
          <SignedIn>
            <LoggedInContent>{children}</LoggedInContent>
            <Toaster />
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}

const LoggedOutContent: FC = () => {
  return (
    <div className="bg-slate-100 flex flex-col items-center justify-center min-h-dvh p-2">
      <h1 className="font-semibold text-2xl">
        Bienvenidos a&nbsp;
        <span className="font-bold text-slate-950 tracking-wide">
          Scalonet.app
        </span>
      </h1>
      <ShowOff />
      <div className="mt-8">
        <SignInButton mode="modal">
          <Button size="sm">Ingresar</Button>
        </SignInButton>
      </div>
    </div>
  );
};

const LoggedInContent: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <div className="grow">{children}</div>
      <Footer />
    </div>
  );
};
