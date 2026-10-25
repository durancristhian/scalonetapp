import { useEffect, useRef } from "react";

export const useRosterViewport = () => {
  const columnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const column = columnRef.current;
    const header = document.querySelector<HTMLElement>("[data-app-header]");
    const footer = document.querySelector("footer");
    const page = column?.closest<HTMLElement>("[data-match-page]");
    if (!column || !header || !footer || !page) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    let frame = 0;

    const measure = () => {
      frame = 0;
      if (!desktop.matches) {
        column.style.removeProperty("--roster-min-height");
        column.style.removeProperty("--roster-height");
        column.style.removeProperty("--roster-inset");
        return;
      }

      const gap = 16;
      const headerBottom = header.getBoundingClientRect().bottom;
      const columnTop = column.getBoundingClientRect().top;
      const footerRect = footer.getBoundingClientRect();
      const pagePadding = parseFloat(getComputedStyle(page).paddingBlockEnd);
      const inset = headerBottom + gap;
      const panelTop = Math.max(columnTop, inset);
      const panelBottom = Math.min(
        window.innerHeight - gap,
        footerRect.top - pagePadding,
      );

      // Reserve only the initial short-page height. The teams can make the page
      // taller, but growing the sticky card must never push the footer away.
      const minHeight = Math.max(
        0,
        window.innerHeight - (columnTop + window.scrollY) - footerRect.height - pagePadding,
      );
      column.style.setProperty("--roster-min-height", `${minHeight}px`);
      column.style.setProperty("--roster-inset", `${inset}px`);
      column.style.setProperty(
        "--roster-height",
        `${Math.max(0, panelBottom - panelTop)}px`,
      );
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    // The title may wrap, and the header, teams and footer can all resize.
    [header, footer, page, column, page.querySelector("h2")].forEach((element) => {
      if (element) observer.observe(element);
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    desktop.addEventListener("change", schedule);
    measure();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
    };
  }, []);

  return columnRef;
};
