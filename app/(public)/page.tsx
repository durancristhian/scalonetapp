"use client";

import { trackAnalytics } from "@/utils/analytics";
import { Loader } from "@/components/loader";
import { LandingExportShowcase } from "@/components/landing-export-showcase";
import { ShowOff } from "@/components/show-off";
import { Button } from "@/components/ui/button";
import { Show, SignInButton, useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect } from "react";
import styles from "./page.module.css";

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
    <div className={styles.page}>
      <Show when="signed-in">
        <Loader />
      </Show>
      <Show when="signed-out">
        <header className={styles.header}>
          <span className="font-bold text-xl tracking-tight">scalonet.app</span>
        </header>
        <main>
          <section className={styles.hero} aria-labelledby="landing-title">
            <div className={styles.intro}>
              <h1 id="landing-title" className={styles.title}>
                Armá los equipos para tu próximo partido.
              </h1>
              <p className={styles.description}>
                Cargá los jugadores, elegí quién juega con quién y compartí las
                formaciones con tu grupo.
              </p>
              <StartMatch />
            </div>
            <div className={styles.example}>
              <LandingExportShowcase />
            </div>
          </section>
          <section
            id="como-funciona"
            className={styles.howItWorks}
            aria-labelledby="how-it-works-title"
          >
            <h2 id="how-it-works-title" className={styles.sectionTitle}>
              Cómo funciona
            </h2>
            <ol className={styles.steps}>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  01
                </span>
                <h3 className="font-semibold text-xl">Cargá los jugadores</h3>
                <p>
                  Agregalos uno por uno o pegá una lista de nombres. Podés subir
                  tus propias fotos.
                </p>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  02
                </span>
                <h3 className="font-semibold text-xl">Armá los equipos</h3>
                <p>
                  Elegí quién juega con quién. Si querés, repartilos al azar o
                  por nivel y posición.
                </p>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
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
        </main>
        <footer className={styles.footer}>
          <ShowOff />
        </footer>
      </Show>
    </div>
  );
};

export default Page;
