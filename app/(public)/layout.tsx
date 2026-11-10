import { siteUrl } from "@/utils/public-content";
import type { Metadata } from "next";
import { type PropsWithChildren } from "react";

const title = "Scalonet.app | Armá equipos de fútbol";
const description =
  "Armá equipos de fútbol con tus amigos. Cargá los jugadores, elegí quién juega con quién y compartí las formaciones como texto o imagen.";
const url = `${siteUrl}/`;
const image = `${siteUrl}/api/og`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  keywords: ["scaloneta", "scalonet.app", "fútbol", "armar equipos de fútbol"],
  openGraph: {
    type: "website",
    url,
    title,
    description,
    siteName: "Scalonet.app",
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
