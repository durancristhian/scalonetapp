"use client";

import Image from "next/image";
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

export function LandingExportShowcase() {
  const stage = useRef<HTMLDivElement>(null);
  const descriptionId = useId();
  const [active, setActive] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [inViewport, setInViewport] = useState(true);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const playing =
    motionAllowed && pageVisible && inViewport && !paused && !hovering;

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
    if (!playing) return;
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % examples.length);
    }, 5500);
    return () => window.clearInterval(interval);
  }, [playing]);

  return (
    <div
      className={styles.showcase}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovering(true);
      }}
      onPointerLeave={() => setHovering(false)}
    >
      <div
        id={descriptionId}
        ref={stage}
        className={styles.stage}
        role="img"
        aria-label={`Los once titulares de Argentina y España en la final del Mundial 2026. ${examples[active].label}.`}
      >
        {examples.map((example, index) => {
          const offset = (index - active + examples.length) % examples.length;
          const position =
            offset > examples.length / 2 ? offset - examples.length : offset;
          if (Math.abs(position) > 3) return null;
          return (
            <Image
              key={example.id}
              src={`/images/landing/${example.id}.webp`}
              width={1280}
              height={example.height}
              alt=""
              aria-hidden="true"
              data-position={position}
              className={styles.sheet}
              sizes="(min-width: 1000px) 40vw, 70vw"
              preload={index === 0}
              loading={index === 0 ? undefined : "eager"}
              draggable={false}
            />
          );
        })}
      </div>
      {motionAllowed ? (
        <button
          type="button"
          className={styles.toggle}
          aria-label={paused ? "Reanudar animación" : "Pausar animación"}
          aria-describedby={descriptionId}
          aria-pressed={paused}
          onFocus={(event) => {
            if (event.currentTarget.matches(":focus-visible")) setPaused(true);
          }}
          onClick={() => setPaused((current) => !current)}
        />
      ) : null}
    </div>
  );
}
