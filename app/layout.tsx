import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import CssBaseline from "@mui/material/CssBaseline";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scalonetapp",
  description: "Scalonetapp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <AppRouterCacheProvider>
        <CssBaseline />
        <body className={inter.className}>{children}</body>
      </AppRouterCacheProvider>
    </html>
  );
}
