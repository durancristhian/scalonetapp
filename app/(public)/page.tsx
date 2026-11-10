"use client";

import { homeDetails, softwareSchema } from "@/utils/public-content";
import { trackAnalytics } from "@/utils/analytics";
import { Loader } from "@/components/loader";
import { LandingExportShowcase } from "@/components/landing-export-showcase";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Show, SignInButton, useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect } from "react";

function StartMatch() {
  return (
    <SignInButton mode="modal">
      <Button
        className="gap-2"
        onClick={() => trackAnalytics("sign_in_clicked")}
      >
        Armar mi partido
        <ArrowRight aria-hidden="true" className="size-4" />
      </Button>
    </SignInButton>
  );
}

const Page: FC = () => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, router, userId]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema).replace(/</g, "\\u003c"),
        }}
      />
      <Show when="signed-in">
        <Loader />
      </Show>
      <Show when="signed-out">
        <header className="border-b border-transparent">
          <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between gap-4 px-4 md:h-14">
            <span className="text-base font-bold leading-normal tracking-normal">
              scalonet.app
            </span>
          </div>
        </header>
        <main className="mx-auto w-[min(100%_-_2rem,80rem)]">
          <section
            className="flex flex-wrap items-center gap-[clamp(2rem,4vw,4rem)] py-[clamp(2rem,5vw,5rem)]"
            aria-labelledby="landing-title"
          >
            <div className="flex flex-[1_1_24rem] flex-col items-start gap-6">
              <h1
                id="landing-title"
                className="max-w-[17ch] text-[clamp(2.25rem,1.4rem_+_2.5vw,3.75rem)] font-bold leading-[1.12] tracking-[-0.04em] text-balance"
              >
                Armá los equipos para tu próximo partido.
              </h1>
              <p className="max-w-[42ch] text-lg leading-[1.6] text-muted-foreground text-pretty">
                Cargá los jugadores, elegí quién juega con quién y compartí las
                formaciones con tu grupo.
              </p>
              <StartMatch />
            </div>
            <div className="min-w-0 flex-[1.5_1_34rem]">
              <LandingExportShowcase />
            </div>
          </section>
          <section
            id="como-funciona"
            className="flex scroll-mbs-6 flex-col gap-10 border-bs border-border py-[clamp(3rem,6vw,5rem)]"
            aria-labelledby="how-it-works-title"
          >
            <h2
              id="how-it-works-title"
              className="text-[clamp(1.75rem,1.25rem_+_1vw,2.25rem)] font-semibold leading-[1.25] tracking-[-0.025em] text-balance"
            >
              Cómo funciona
            </h2>
            <ol className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-8">
              <li className="flex flex-col items-start gap-3 [&>p]:max-w-[36ch] [&>p]:text-muted-foreground [&>p]:text-pretty">
                <span
                  className="text-sm leading-6 text-muted-foreground"
                  aria-hidden="true"
                >
                  01
                </span>
                <h3 className="font-semibold text-xl">Cargá los jugadores</h3>
                <p>
                  Agregalos uno por uno o pegá una lista de nombres. Podés subir
                  tus propias fotos.
                </p>
              </li>
              <li className="flex flex-col items-start gap-3 [&>p]:max-w-[36ch] [&>p]:text-muted-foreground [&>p]:text-pretty">
                <span
                  className="text-sm leading-6 text-muted-foreground"
                  aria-hidden="true"
                >
                  02
                </span>
                <h3 className="font-semibold text-xl">Armá los equipos</h3>
                <p>
                  Elegí quién juega con quién. Si querés, repartilos al azar o
                  por nivel y posición.
                </p>
              </li>
              <li className="flex flex-col items-start gap-3 [&>p]:max-w-[36ch] [&>p]:text-muted-foreground [&>p]:text-pretty">
                <span
                  className="text-sm leading-6 text-muted-foreground"
                  aria-hidden="true"
                >
                  03
                </span>
                <h3 className="font-semibold text-xl">
                  Compartí las formaciones
                </h3>
                <p>
                  Copiá los equipos como texto o descargá una imagen con
                  avatares o fotos.
                </p>
              </li>
            </ol>
          </section>
          <section
            className="flex flex-col gap-8 border-bs border-border py-[clamp(3rem,6vw,5rem)]"
            aria-labelledby="questions-title"
          >
            <h2 id="questions-title" className="text-2xl font-semibold">
              Preguntas frecuentes
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] gap-8">
              {homeDetails.map((section) => (
                <section key={section.title} className="flex flex-col gap-3">
                  <h3 className="text-xl font-semibold">{section.title}</h3>
                  <p className="text-muted-foreground text-pretty">
                    {section.text}
                  </p>
                </section>
              ))}
            </div>
          </section>
        </main>
        <PublicFooter />
      </Show>
    </div>
  );
};

export default Page;
