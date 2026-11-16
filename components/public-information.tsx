import type { Metadata } from "next";
import { Show } from "@clerk/nextjs";
import { Feedback } from "@/components/feedback";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PublicHeader } from "@/components/public-header";
import {
  publicPages,
  publicContact,
  siteUrl,
  type PublicPath,
} from "@/utils/public-content";

export function informationMetadata(path: PublicPath): Metadata {
  const page = publicPages[path];
  return {
    title: { absolute: `${page.title} | Scalonet.app` },
    description: page.sections[0].text,
    alternates: { canonical: `${siteUrl}${path}` },
    openGraph: {
      title: page.title,
      description: page.sections[0].text,
      url: `${siteUrl}${path}`,
    },
  };
}

export function PublicInformation({ path }: { path: PublicPath }) {
  const page = publicPages[path];
  return (
    <div className="flex min-h-dvh flex-col">
      <Show when="signed-in">
        <Header />
      </Show>
      <Show when="signed-out">
        <PublicHeader />
      </Show>
      <main className="mx-auto flex w-[min(100%_-_2rem,48rem)] grow flex-col gap-8 py-12">
        <h1 className="text-3xl font-bold text-balance">{page.title}</h1>
        {page.sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="text-muted-foreground text-pretty">{section.text}</p>
          </section>
        ))}
        {path === "/contact" && (
          <a
            className="break-words underline underline-offset-4"
            href={`mailto:${publicContact.email}`}
          >
            {publicContact.email}
          </a>
        )}
      </main>
      <Footer>
        <Show when="signed-in">
          <Feedback />
        </Show>
      </Footer>
    </div>
  );
}
