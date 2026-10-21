import type { Metadata } from "next";
import { type PropsWithChildren } from "react";

const title = "Armá equipos de fútbol | scalonet.app";
const description =
  "Armá equipos de fútbol con tus amigos. Cargá jugadores, distribuí equipos al azar o por posición y nivel, y descargá una imagen para compartir.";
const url = "https://www.scalonet.app/";
const image = "https://www.scalonet.app/api/og";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  keywords: ["scaloneta", "scalonet.app", "fútbol", "armar equipos de fútbol"],
  openGraph: {
    type: "website",
    url,
    title,
    description,
    siteName: "scalonet.app",
    locale: "es_AR",
    images: [{ url: image, width: 1200, height: 630, alt: "scalonet.app" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@durancristhian",
    images: image,
  },
};

export default function PublicLayout({ children }: PropsWithChildren) {
  return children;
}
