"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/utils/cn";

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
const toggleClassName =
  "relative grid size-12 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-foreground active:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted [&>svg:not([data-carousel-timer])]:size-4";
const sheetPositions: Record<number, string> = {
  0: "z-5 [transform:translateY(-50%)]",
  [-1]: "z-4 [transform:translateY(-50%)_translateX(-43%)_translateZ(-100px)_rotateY(50deg)_scale(0.86)]",
  1: "z-4 [transform:translateY(-50%)_translateX(43%)_translateZ(-100px)_rotateY(-50deg)_scale(0.86)]",
  [-2]: "z-3 [transform:translateY(-50%)_translateX(-67%)_translateZ(-180px)_rotateY(65deg)_scale(0.72)]",
  2: "z-3 [transform:translateY(-50%)_translateX(67%)_translateZ(-180px)_rotateY(-65deg)_scale(0.72)]",
  [-3]: "z-2 opacity-0 [transform:translateY(-50%)_translateX(-90%)_translateZ(-250px)_rotateY(75deg)_scale(0.6)]",
  3: "z-2 opacity-0 [transform:translateY(-50%)_translateX(90%)_translateZ(-250px)_rotateY(-75deg)_scale(0.6)]",
};

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
      className="relative grid min-w-0"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Ejemplos de formaciones"
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) setPaused(true);
      }}
    >
      <div className="row-start-3 flex justify-center gap-1">
        {motionAllowed ? (
          <button
            type="button"
            className={toggleClassName}
            aria-label={paused ? "Reanudar animación" : "Pausar animación"}
            aria-describedby={descriptionId}
            onClick={() => setPaused((current) => !current)}
          >
            <svg
              data-carousel-timer
              className="absolute size-10 -rotate-90 fill-none stroke-current stroke-2"
              viewBox="0 0 40 40"
              aria-hidden="true"
            >
              <circle className="opacity-15" cx="20" cy="20" r="17" />
              <circle
                key={active}
                data-playing={playing}
                className="[stroke-dasharray:1] [stroke-dashoffset:1] motion-safe:animate-carousel-countdown motion-safe:data-[playing=false]:[animation-play-state:paused]"
                cx="20"
                cy="20"
                r="17"
                pathLength="1"
              />
            </svg>
            {paused ? (
              <Play aria-hidden="true" />
            ) : (
              <Pause aria-hidden="true" />
            )}
          </button>
        ) : null}
        <button
          type="button"
          className={toggleClassName}
          aria-label="Ver ejemplo anterior"
          aria-controls={descriptionId}
          onClick={() =>
            setActive(
              (current) => (current - 1 + examples.length) % examples.length,
            )
          }
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          className={toggleClassName}
          aria-label="Ver ejemplo siguiente"
          aria-controls={descriptionId}
          onClick={() =>
            setActive((current) => (current + 1) % examples.length)
          }
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <div className="row-start-1 w-full overflow-clip py-8">
        <div
          id={descriptionId}
          ref={stage}
          className="relative isolate mx-[clamp(1.25rem,5%,2.5rem)] aspect-[1.18] perspective-[1000px]"
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
                className={cn(
                  "absolute start-[18%] inset-bs-1/2 w-[64%] cursor-pointer select-none rounded-lg border-0 bg-transparent p-0 shadow-[0_0.5rem_1.75rem_oklch(0.2_0_none_/_0.13)] active:brightness-[0.96] motion-safe:[transition:transform_450ms_cubic-bezier(0.22,1,0.36,1),opacity_300ms_cubic-bezier(0.22,1,0.36,1)]",
                  sheetPositions[position],
                )}
                data-position={position}
                style={{ aspectRatio: `1280 / ${example.height}` }}
                inert={Math.abs(position) > 2}
                tabIndex={-1}
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
                  className="pointer-events-none block h-auto w-full rounded-[inherit]"
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
      <p
        className="row-start-2 mx-auto mbe-2 grid min-h-[3em] w-[min(calc(100%_-_2.5rem),40ch)] place-items-center text-center text-sm leading-normal text-balance text-muted-foreground"
        aria-live={playing ? "off" : "polite"}
        aria-atomic="true"
      >
        <span className="sr-only">
          Ejemplo {active + 1} de {examples.length}:{" "}
        </span>
        <span key={active} className="motion-safe:animate-caption-enter">
          {examples[active].label}
        </span>
      </p>
    </div>
  );
}
