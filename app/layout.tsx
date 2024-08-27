import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "scalonetapp",
  /* TODO: update meta description */
  description: "scalonetapp",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={inter.className}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="grow">{children}</div>
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
