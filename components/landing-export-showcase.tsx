"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./landing-export-showcase.module.css";

const examples = [
  { id: "clasico", label: "Césped sin avatares", height: 842 },
  { id: "potrero", label: "Potrero con avatares redondos", height: 1490 },
  { id: "lluvia", label: "Césped con lluvia", height: 1490 },
  {
    id: "nieve",
    label: "Césped natural con nieve y avatares centrados",
    height: 1490,
  },
  {
    id: "centrados",
    label: "Césped con avatares cuadrados centrados",
    height: 1490,
  },
  {
    id: "natural",
    label: "Césped natural con avatares redondos",
    height: 1490,
  },
  {
    id: "potrero-lluvia",
    label: "Potrero con lluvia y avatares centrados",
    height: 1490,
  },
  {
    id: "pasto-nieve",
    label: "Césped con nieve y avatares cuadrados",
    height: 1490,
  },
  {
    id: "natural-lluvia",
    label: "Césped natural con lluvia y avatares centrados",
    height: 1490,
  },
  {
    id: "potrero-nieve",
    label: "Potrero con nieve y avatares cuadrados centrados",
    height: 1490,
  },
] as const;

const duration = 5000;

export function LandingExportShowcase() {
  const stage = useRef<HTMLDivElement>(null);
  const descriptionId = useId();
  const [active, setActive] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [inViewport, setInViewport] = useState(true);
  const [paused, setPaused] = useState(false);
  const countdown = useRef({ active: 0, remaining: duration });
  const playing = motionAllowed && pageVisible && inViewport && !paused;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setMotionAllowed(!preference.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!stage.current || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInViewport(entry.isIntersecting);
    });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (countdown.current.active !== active) {
      countdown.current = { active, remaining: duration };
    }
    if (!motionAllowed) countdown.current.remaining = duration;
    if (!playing) return;
    const started = Date.now();
    const timeout = window.setTimeout(() => {
      setActive((current) => (current + 1) % examples.length);
    }, countdown.current.remaining);
    return () => {
      window.clearTimeout(timeout);
      countdown.current.remaining = Math.max(
        0,
        countdown.current.remaining - (Date.now() - started),
      );
    };
  }, [active, playing, motionAllowed]);

  return (
    <div
      className={styles.showcase}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Ejemplos de formaciones"
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) setPaused(true);
      }}
    >
      <div className={styles.viewport}>
        <div
          id={descriptionId}
          ref={stage}
          className={styles.stage}
          role="group"
          aria-label={`Los once titulares de Argentina y España en la final del Mundial 2026. ${examples[active].label}.`}
        >
          {examples.map((example, index) => {
            const offset = (index - active + examples.length) % examples.length;
            const position =
              offset > examples.length / 2 ? offset - examples.length : offset;
            if (Math.abs(position) > 3) return null;
            return (
              <button
                key={example.id}
                type="button"
                className={styles.sheet}
                data-position={position}
                style={{ aspectRatio: `1280 / ${example.height}` }}
                inert={Math.abs(position) > 2}
                aria-label={
                  position === 0
                    ? "Ver siguiente ejemplo"
                    : `Ver ejemplo: ${example.label}`
                }
                aria-current={position === 0 ? "true" : undefined}
                onClick={() =>
                  setActive((current) =>
                    index === current ? (current + 1) % examples.length : index,
                  )
                }
              >
                <Image
                  src={`/images/landing/${example.id}.webp`}
                  width={1280}
                  height={example.height}
                  alt=""
                  sizes="(min-width: 1000px) 40vw, 70vw"
                  preload={index === 0}
                  loading={index === 0 ? undefined : "eager"}
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      </div>
      {motionAllowed ? (
        <button
          type="button"
          className={styles.toggle}
          aria-label={paused ? "Reanudar animación" : "Pausar animación"}
          aria-describedby={descriptionId}
          aria-pressed={paused}
          onClick={() => setPaused((current) => !current)}
        >
          <svg className={styles.timer} viewBox="0 0 40 40" aria-hidden="true">
            <circle className={styles.track} cx="20" cy="20" r="17" />
            <circle
              key={active}
              className={styles.progress}
              cx="20"
              cy="20"
              r="17"
              pathLength="1"
              style={{
                animationDuration: `${duration}ms`,
                animationPlayState: playing ? "running" : "paused",
              }}
            />
          </svg>
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>
      ) : null}
    </div>
  );
}
